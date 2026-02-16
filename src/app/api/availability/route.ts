import { NextResponse } from "next/server";
import { z } from "zod";
import { intersects, toLocalLabel } from "@/lib/utils";
import { generateCandidateSlots } from "@/lib/scheduling";
import { getBusyWindowsCombined } from "@/lib/booking-conflicts";

const schema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  durationMinutes: z.number().int().positive()
});

export async function POST(request: Request) {
  try {
    const ownerId = process.env.DEFAULT_OWNER_ID;
    if (!ownerId) throw new Error("DEFAULT_OWNER_ID env var missing.");

    const payload = schema.parse(await request.json());
    const slots = generateCandidateSlots(payload.date, payload.durationMinutes);
    if (!slots.length) {
      return NextResponse.json({ slots: [] });
    }

    const busy = await getBusyWindowsCombined(
      ownerId,
      slots[0].start.toISOString(),
      slots[slots.length - 1].busyCheckEnd.toISOString()
    );

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
