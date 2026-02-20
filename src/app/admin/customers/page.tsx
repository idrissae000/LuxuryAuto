import { redirect } from "next/navigation";
import { requireAdminUser } from "@/lib/admin-data";

export default async function AdminCustomersPage() {
  const admin = await requireAdminUser();
  if (!admin) redirect("/admin/login");

  const { supabase, user } = admin;
  const { data: customers } = await supabase
    .from("customers")
    .select("id,name,email,phone,bookings(count)")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <section className="section-shell">
      <h1 className="text-3xl font-bold">Customers</h1>
      <div className="mt-6 space-y-3">
        {(customers ?? []).map((customer) => (
          <article key={customer.id} className="card flex items-center justify-between">
            <div>
              <p className="font-semibold">{customer.name}</p>
              <p className="text-sm text-white/70">{customer.email} • {customer.phone}</p>
            </div>
            <p className="text-sm text-brand-blue">Bookings: {Array.isArray(customer.bookings) ? customer.bookings[0]?.count ?? 0 : 0}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
