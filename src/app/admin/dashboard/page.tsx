import Link from "next/link";
import { redirect } from "next/navigation";
import { requireAdminUser } from "@/lib/admin-data";
import { formatCurrency, formatDateTime } from "@/lib/utils";

const filters = [
  { key: "upcoming", label: "Upcoming" },
  { key: "completed", label: "Completed" },
  { key: "canceled", label: "Canceled" },
  { key: "all", label: "All" }
] as const;

export default async function AdminDashboardPage({ searchParams }: { searchParams: Promise<{ filter?: string }> }) {
  const admin = await requireAdminUser();
  if (!admin) redirect("/admin/login");

  const params = await searchParams;
  const filter = params.filter ?? "upcoming";

  const { supabase, user } = admin;
  let query = supabase
    .from("bookings")
    .select("id,status,scheduled_start,estimated_total_cents,customers(name),services(name)")
    .eq("owner_id", user.id)
    .order("scheduled_start", { ascending: true })
    .limit(50);

  if (filter === "completed") query = query.eq("status", "completed");
  if (filter === "canceled") query = query.eq("status", "canceled");
  if (filter === "upcoming") query = query.in("status", ["scheduled", "in_progress"]);

  const { data: bookings } = await query;

  const { count: weekCount } = await supabase
    .from("bookings")
    .select("*", { count: "exact", head: true })
    .eq("owner_id", user.id)
    .gte("scheduled_start", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

  const { data: completedThisMonth } = await supabase
    .from("bookings")
    .select("estimated_total_cents")
    .eq("owner_id", user.id)
    .eq("status", "completed")
    .gte("scheduled_start", new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString());

  const revenue = (completedThisMonth ?? []).reduce((sum, booking) => sum + Number(booking.estimated_total_cents ?? 0), 0);
  const avg = completedThisMonth?.length ? Math.round(revenue / completedThisMonth.length) : 0;

  return (
    <section className="section-shell space-y-8">
      <h1 className="text-4xl font-bold">Admin Dashboard</h1>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="card">
          <p className="text-sm text-white/70">Bookings This Week</p>
          <p className="text-3xl font-semibold">{weekCount ?? 0}</p>
        </div>
        <div className="card">
          <p className="text-sm text-white/70">Revenue This Month</p>
          <p className="text-3xl font-semibold">{formatCurrency(revenue)}</p>
        </div>
        <div className="card">
          <p className="text-sm text-white/70">Average Ticket</p>
          <p className="text-3xl font-semibold">{formatCurrency(avg)}</p>
        </div>
      </div>

      <div className="card">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-2xl font-semibold">Bookings</h2>
          <div className="flex items-center gap-3">
            {filters.map((item) => (
              <Link
                key={item.key}
                href={`/admin/dashboard?filter=${item.key}`}
                className={`rounded-full px-3 py-1 text-sm ${filter === item.key ? "bg-brand-blue text-white" : "border border-white/20 text-white/70"}`}
              >
                {item.label}
              </Link>
            ))}
            <Link href="/admin/customers" className="text-brand-blue">
              View Customers
            </Link>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-white/60">
              <tr>
                <th>When</th>
                <th>Customer</th>
                <th>Service</th>
                <th>Status</th>
                <th>Total</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {(bookings ?? []).map((booking) => (
                <tr key={booking.id} className="border-t border-white/10">
                  <td className="py-3">{formatDateTime(booking.scheduled_start)}</td>
                  <td>{(booking.customers as { name?: string } | null)?.name ?? "N/A"}</td>
                  <td>{(booking.services as { name?: string } | null)?.name ?? "N/A"}</td>
                  <td>{booking.status}</td>
                  <td>{formatCurrency(booking.estimated_total_cents ?? 0)}</td>
                  <td>
                    <Link href={`/admin/bookings/${booking.id}`} className="text-brand-blue">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
