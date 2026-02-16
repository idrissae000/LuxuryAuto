import Link from "next/link";
import { defaultAddons, defaultServices } from "@/lib/data";
import { formatCurrency } from "@/lib/utils";

export default function PricingPage() {
  return (
    <section className="section-shell space-y-12">
      <div>
        <h1 className="text-4xl font-bold">Pricing</h1>
        <p className="mt-3 text-white/70">Select your package, vehicle size, and add-ons during checkout.</p>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {defaultServices.map((service) => (
          <article key={service.id} className="card flex flex-col">
            <h2 className="text-2xl font-semibold">{service.name}</h2>
            <p className="mt-2 text-white/70">{service.description}</p>
            <p className="mt-3 text-brand-blue">{service.duration_minutes} min</p>
            <p className="mt-1 text-2xl font-semibold">{formatCurrency(service.base_price_cents)}</p>
            <p className="mt-4 text-sm text-white/70">Vehicle multipliers are applied at booking (Sedan/SUV/Truck).</p>
            <Link href="/book" className="mt-6 rounded-full bg-brand-blue px-4 py-2 text-center font-semibold">Book</Link>
          </article>
        ))}
      </div>

      <div className="card">
        <h3 className="text-2xl font-semibold">Add-ons</h3>
        <ul className="mt-4 space-y-2 text-white/75">
          {defaultAddons.map((addon) => (
            <li key={addon.id} className="flex justify-between border-b border-white/10 pb-2">
              <span>{addon.name}</span>
              <span>{formatCurrency(addon.price_cents)} (+{addon.extra_minutes} min)</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
