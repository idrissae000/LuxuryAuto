import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { supabaseAdmin } from "@/lib/supabase-admin";

const schema = z.object({
  status: z.enum(["scheduled", "in_progress", "completed", "canceled"]),
  internal_notes: z.string().optional(),
  assigned_tech: z.string().optional(),
  final_total_cents: z.number().int().nonnegative().nullable().optional()
});

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const payload = schema.parse(await request.json());
    const supabase = await createSupabaseServerClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { error } = await supabaseAdmin
      .from("bookings")
      .update(payload)
      .eq("id", id)
      .eq("owner_id", user.id);

    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to update booking." }, { status: 400 });
  }
}
