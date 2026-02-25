import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { defaultAddons, defaultServices } from "@/lib/data";

export async function GET() {
  try {
    const ownerId = process.env.DEFAULT_OWNER_ID;
    if (!ownerId) {
      return NextResponse.json({ services: defaultServices, addons: defaultAddons, source: "fallback" });
    }

    const [{ data: services, error: servicesError }, { data: addons, error: addonsError }] = await Promise.all([
      supabaseAdmin
        .from("services")
        .select("id,name,description,base_price_cents,duration_minutes")
        .eq("owner_id", ownerId)
        .eq("is_active", true)
        .order("created_at", { ascending: true }),
      supabaseAdmin
        .from("addons")
        .select("id,name,price_cents,extra_minutes")
        .eq("owner_id", ownerId)
        .eq("is_active", true)
        .order("created_at", { ascending: true })
    ]);

    if (servicesError || addonsError) {
      return NextResponse.json({ services: defaultServices, addons: defaultAddons, source: "fallback" });
    }

    return NextResponse.json({
      services: services?.length ? services : defaultServices,
      addons: addons?.length ? addons : defaultAddons,
      source: "database"
    });
  } catch {
    return NextResponse.json({ services: defaultServices, addons: defaultAddons, source: "fallback" });
  }
}
