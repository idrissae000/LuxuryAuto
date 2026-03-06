import { NextResponse } from "next/server";
import { z } from "zod";
import { defaultServices } from "@/lib/data";
import { getServiceDurationMinutes } from "@/lib/constants";
import { intersects, toLocalLabel } from "@/lib/utils";
import { generateCandidateSlots } from "@/lib/scheduling";
import { getBusyWindowsFromGoogle, isGoogleCalendarConfigured, type BusyWindow } from "@/lib/google-calendar";

const schema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  serviceId: z.string().uuid().optional(),
  serviceName: z.string().optional()
});

const asBusyWindows = (value: unknown): BusyWindow[] => {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is BusyWindow => {
    if (!item || typeof item !== "object") return false;
    const record = item as Record<string, unknown>;
    return typeof record.start === "string" && typeof record.end === "string";
  });
};

const resolveServiceDuration = (serviceId?: string, serviceName?: string) => {
  const byId = serviceId ? defaultServices.find((service) => service.id === serviceId) : undefined;
  const byName = serviceName ? defaultServices.find((service) => service.name === serviceName) : undefined;
  const service = byId ?? byName ?? defaultServices[0];
  return getServiceDurationMinutes(service.name, service.duration_minutes);
};

export async function POST(request: Request) {
  try {
    if (!isGoogleCalendarConfigured()) {
      return NextResponse.json(
        { error: "Google Calendar is not configured. Add Google env vars to enable booking availability." },
        { status: 400 }
      );
    }

    const payload = schema.parse(await request.json());
    const durationMinutes = resolveServiceDuration(payload.serviceId, payload.serviceName);
    const slots = generateCandidateSlots(payload.date, durationMinutes);

    if (!slots.length) {
      return NextResponse.json({ slots: [] });
    }

    const busyRaw = await getBusyWindowsFromGoogle(
      slots[0].start.toISOString(),
      slots[slots.length - 1].busyCheckEnd.toISOString()
    );

    const busy = asBusyWindows(busyRaw);
    const available = slots.filter((slot) => !intersects(slot, busy));

    return NextResponse.json({
      slots: available.map((slot) => ({ start: slot.start.toISOString(), label: toLocalLabel(slot.start) }))
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to fetch availability." },
      { status: 400 }
    );
  }
}
