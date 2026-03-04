import { redirect } from "next/navigation";
import { requireAdminUser } from "@/lib/admin-data";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { BookingEditForm } from "@/components/admin/booking-edit-form";

export default async function AdminBookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdminUser();
  if (!admin) redirect("/admin/login");

  const { id } = await params;
  const { supabase, user } = admin;

  const { data: booking } = await supabase
    .from("bookings")
    .select("*,customers(name,email,phone),services(name)")
    .eq("owner_id", user.id)
    .eq("id", id)
    .single();

  if (!booking) redirect("/admin/dashboard");

  const customer = booking.customers as { name?: string; email?: string; phone?: string } | null;
  const service = booking.services as { name?: string } | null;

  return (
    <section className="section-shell max-w-3xl">
      <h1 className="text-3xl font-bold">Booking Detail</h1>
      <div className="mt-6 space-y-3 card">
        <p><span className="text-white/60">Customer:</span> {customer?.name ?? "N/A"}</p>
        <p><span className="text-white/60">Email:</span> {customer?.email ?? "N/A"}</p>
        <p><span className="text-white/60">Phone:</span> {customer?.phone ?? "N/A"}</p>
        <p><span className="text-white/60">Service:</span> {service?.name ?? "N/A"}</p>
        <p><span className="text-white/60">When:</span> {formatDateTime(booking.scheduled_start)}</p>
        <p><span className="text-white/60">Status:</span> {booking.status}</p>
        <p>
          <span className="text-white/60">Final Price:</span>{" "}
          {formatCurrency(booking.final_total_cents ?? booking.estimated_total_cents)}
        </p>
        <p><span className="text-white/60">Internal Notes:</span> {booking.internal_notes ?? "N/A"}</p>
        <p><span className="text-white/60">Assigned Tech:</span> {booking.assigned_tech ?? "Unassigned"}</p>
      </div>

      <BookingEditForm
        bookingId={booking.id}
        initialStatus={booking.status}
        initialInternalNotes={booking.internal_notes ?? ""}
        initialAssignedTech={booking.assigned_tech ?? ""}
        initialFinalTotalCents={booking.final_total_cents ?? null}
      />
    </section>
  );
}
