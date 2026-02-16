import { NextResponse } from "next/server";
import { addMinutes } from "date-fns";
import { z } from "zod";
import { createCalendarEvent } from "@/lib/google-calendar";
import { formatCurrency } from "@/lib/utils";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { TRAVEL_BUFFER_MINUTES } from "@/lib/constants";
import { sendBookingEmails } from "@/lib/email";
import { generateCandidateSlots } from "@/lib/scheduling";
import { getBusyWindowsCombined } from "@/lib/booking-conflicts";

const schema = z.object({
  serviceId: z.string().uuid(),
  vehicleSize: z.enum(["Sedan", "SUV", "Truck"]),
  addonIds: z.array(z.string().uuid()),
  startTime: z.string().datetime(),
  name: z.string().min(2),
  phone: z.string().min(7),
  email: z.string().email(),
  address: z.string().min(5),
  notes: z.string().optional()
});

export async function POST(request: Request) {
  try {
    const payload = schema.parse(await request.json());
    const ownerId = process.env.DEFAULT_OWNER_ID;
    if (!ownerId) throw new Error("DEFAULT_OWNER_ID env var missing.");

    const [{ data: service, error: serviceError }, { data: addons, error: addonsError }] = await Promise.all([
      supabaseAdmin
        .from("services")
        .select("id,name,base_price_cents,duration_minutes")
        .eq("owner_id", ownerId)
        .eq("is_active", true)
        .eq("id", payload.serviceId)
        .single(),
      payload.addonIds.length
        ? supabaseAdmin
            .from("addons")
            .select("id,name,price_cents,extra_minutes")
            .eq("owner_id", ownerId)
            .eq("is_active", true)
            .in("id", payload.addonIds)
        : Promise.resolve({ data: [], error: null })
    ]);

    if (serviceError || !service) throw new Error("Selected service is unavailable.");
    if (addonsError) throw addonsError;

    const durationMinutes = service.duration_minutes + (addons ?? []).reduce((sum, addon) => sum + addon.extra_minutes, 0);
    const start = new Date(payload.startTime);

    if (Number.isNaN(start.getTime()) || start.getTime() < Date.now()) {
      return NextResponse.json({ error: "Please choose a future appointment time." }, { status: 400 });
    }

    const dateIso = start.toISOString().slice(0, 10);
    const validSlot = generateCandidateSlots(dateIso, durationMinutes).some(
      (slot) => slot.start.toISOString() === start.toISOString()
    );

    if (!validSlot) {
      return NextResponse.json({ error: "Selected time is outside business hours." }, { status: 400 });
    }

    const end = addMinutes(start, durationMinutes);
    const busyCheckEnd = addMinutes(end, TRAVEL_BUFFER_MINUTES);
    const busy = await getBusyWindowsCombined(ownerId, start.toISOString(), busyCheckEnd.toISOString());

    if (busy.length > 0) {
      return NextResponse.json(
        { error: "That time was just booked—please choose another slot." },
        { status: 409 }
      );
    }

    const estimatedTotal = service.base_price_cents + (addons ?? []).reduce((sum, addon) => sum + addon.price_cents, 0);

    const { data: customer, error: customerError } = await supabaseAdmin
      .from("customers")
      .insert({ owner_id: ownerId, name: payload.name, email: payload.email, phone: payload.phone })
      .select("id")
      .single();

    if (customerError || !customer) throw customerError ?? new Error("Unable to create customer.");

    const googleEventId = await createCalendarEvent({
      start: start.toISOString(),
      end: end.toISOString(),
      serviceName: service.name,
      vehicleSize: payload.vehicleSize,
      customerName: payload.name,
      phone: payload.phone,
      email: payload.email,
      address: payload.address,
      addons: (addons ?? []).map((addon) => addon.name),
      notes: payload.notes,
      estimatedTotal: formatCurrency(estimatedTotal)
    });

    const { data: booking, error: bookingError } = await supabaseAdmin
      .from("bookings")
      .insert({
        owner_id: ownerId,
        customer_id: customer.id,
        service_id: service.id,
        vehicle_size: payload.vehicleSize,
        scheduled_start: start.toISOString(),
        scheduled_end: end.toISOString(),
        address: payload.address,
        notes: payload.notes,
        status: "scheduled",
        estimated_total_cents: estimatedTotal,
        google_event_id: googleEventId ?? undefined
      })
      .select("id")
      .single();

    if (bookingError || !booking) throw bookingError ?? new Error("Unable to create booking.");

    await sendBookingEmails({
      ownerEmail: process.env.OWNER_NOTIFICATION_EMAIL ?? "",
      customerEmail: payload.email,
      customerName: payload.name,
      service: service.name,
      dateTime: start.toLocaleString("en-US")
    });

    return NextResponse.json({ bookingId: booking.id });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to book." }, { status: 400 });
  }
}
