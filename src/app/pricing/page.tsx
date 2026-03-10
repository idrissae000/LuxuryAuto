import Link from "next/link";
import { defaultAddons, defaultServices } from "@/lib/data";
import { formatCurrency } from "@/lib/utils";

export default function PricingPage() {
  return (
    <section className="section-shell space-y-12">
      <div>
        <h1 className="text-4xl font-bold">Pricing</h1>
        <p className="mt-3 text-white/70">Simple package pricing for Houston/Cypress mobile detailing.</p>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {defaultServices.map((service) => (
          <article key={service.id} className="card flex flex-col bg-gradient-to-b from-white/5 to-transparent">
            <h2 className="text-2xl font-semibold">{service.name}</h2>
            <p className="mt-2 text-white/70">{service.description}</p>
            <p className="mt-3 text-brand-blue">{service.duration_minutes} min</p>
            <p className="mt-1 text-2xl font-semibold">{formatCurrency(service.base_price_cents)}</p>
            <p className="mt-4 text-sm text-white/70">Booking is completed directly on this website.</p>
            <Link
              href={`/book?serviceId=${service.id}`}
              className="btn-primary mt-6 rounded-full px-4 py-2 text-center font-semibold"
            >
              Book
            </Link>
          </article>
        ))}
      </div>

      {defaultAddons.length > 0 && (
        <div className="card">
          <h3 className="text-2xl font-semibold">Optional Add-Ons</h3>
          <p className="mt-3 text-white/70">Enhance any service with these optional extras:</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {defaultAddons.map((addon) => (
              <div key={addon.id} className="flex items-center justify-between rounded-xl border border-white/10 p-4 text-white/80">
                <span>{addon.name}</span>
                <span className="shrink-0 font-semibold text-brand-blue">{formatCurrency(addon.price_cents)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
