import { NextResponse } from "next/server";
import { addMinutes } from "date-fns";
import { z } from "zod";
import { defaultServices } from "@/lib/data";
import { TRAVEL_BUFFER_MINUTES, getServiceDurationMinutes } from "@/lib/constants";
import { sendBookingEmails } from "@/lib/email";
import { intersects } from "@/lib/utils";
import { createGoogleBookingEvent, getBusyWindowsFromGoogle, isGoogleCalendarConfigured } from "@/lib/google-calendar";
import { sendBookingConfirmationSms } from "@/lib/sms";

const schema = z.object({
  serviceId: z.string().uuid().optional(),
  serviceName: z.string().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startTime: z.string().datetime(),
  name: z.string().min(2),
  phone: z.string().regex(/^\d{10}$/, "Phone number must be exactly 10 digits."),
  address: z.string().min(5),
  email: z.string().email().optional().or(z.literal("")),
  notes: z.string().optional()
});

const resolveService = (serviceId?: string, serviceName?: string) => {
  const byId = serviceId ? defaultServices.find((service) => service.id === serviceId) : undefined;
  const byName = serviceName ? defaultServices.find((service) => service.name === serviceName) : undefined;
  return byId ?? byName ?? defaultServices[0];
};


export async function POST(request: Request) {
  try {
    if (!isGoogleCalendarConfigured()) {
      return NextResponse.json(
        { error: "Google Calendar is not configured. Add Google env vars before accepting bookings." },
        { status: 400 }
      );
    }

    const payload = schema.parse(await request.json());
    const service = resolveService(payload.serviceId, payload.serviceName);
    const durationMinutes = getServiceDurationMinutes(service.name, service.duration_minutes);
    const start = new Date(payload.startTime);

    if (Number.isNaN(start.getTime()) || start.getTime() < Date.now()) {
      return NextResponse.json({ error: "Please choose a future appointment time." }, { status: 400 });
    }

    const normalizedStart = new Date(start.toISOString());
    const end = addMinutes(normalizedStart, durationMinutes);
    const busyCheckEnd = addMinutes(end, TRAVEL_BUFFER_MINUTES);

    const busy = await getBusyWindowsFromGoogle(normalizedStart.toISOString(), busyCheckEnd.toISOString());
    const conflicts = intersects({ start: normalizedStart, busyCheckEnd }, busy);

    if (conflicts) {
      return NextResponse.json(
        { error: "That time was just booked—please choose another slot." },
        { status: 409 }
      );
    }

    const googleEventId = await createGoogleBookingEvent({
      start: normalizedStart.toISOString(),
      end: end.toISOString(),
      service: service.name,
      customerName: payload.name,
      phone: payload.phone,
      address: payload.address,
      email: payload.email || undefined,
      notes: payload.notes
    });

    await sendBookingEmails({
      ownerEmail: process.env.OWNER_NOTIFICATION_EMAIL ?? "",
      customerEmail: payload.email || `${payload.phone}@no-email.local`,
      customerName: payload.name,
      service: service.name,
      dateTime: normalizedStart.toLocaleString("en-US")
    });

    // Fire-and-forget SMS — never blocks the booking response
    sendBookingConfirmationSms(payload.phone, normalizedStart).catch(() => {});

    return NextResponse.json({ bookingId: googleEventId ?? crypto.randomUUID() });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to book." }, { status: 400 });
  }
}
