import Image from "next/image";
import Link from "next/link";
import { defaultServices, testimonials } from "@/lib/data";
import { formatCurrency } from "@/lib/utils";

const gallery = [
  "https://images.unsplash.com/photo-1485463611174-f302f6a5c1c9?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1493238792000-8113da705763?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1549924231-f129b911e442?auto=format&fit=crop&w=800&q=80"
];

export default function HomePage() {
  return (
    <>
      <section className="section-shell">
        <div className="grid items-center gap-8 lg:grid-cols-2">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-brand-blue">Premium Mobile Detailing</p>
            <h1 className="mt-3 text-4xl font-bold sm:text-6xl">Luxury Auto Detailz</h1>
            <p className="mt-4 max-w-xl text-white/75">Texas mobile detailing with showroom-quality results at your driveway.</p>
            <div className="mt-8 flex gap-4">
              <Link href="/book" className="rounded-full bg-brand-blue px-6 py-3 font-semibold shadow-glow">Book Now</Link>
              <Link href="/pricing" className="rounded-full border border-white/20 px-6 py-3 font-semibold">View Pricing</Link>
            </div>
          </div>
          <div className="card">
            <Image src="/logo.svg" alt="Luxury Auto Detailz logo" width={480} height={480} className="mx-auto rounded-3xl" />
          </div>
        </div>
      </section>

      <section className="section-shell">
        <h2 className="text-3xl font-semibold">Services</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {defaultServices.map((service) => (
            <article key={service.id} className="card">
              <h3 className="text-xl font-semibold">{service.name}</h3>
              <p className="mt-2 text-sm text-white/70">{service.description}</p>
              <p className="mt-4 text-sm text-brand-blue">From {formatCurrency(service.base_price_cents)} • {service.duration_minutes} min</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section-shell">
        <h2 className="text-3xl font-semibold">Before & After</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {gallery.map((src) => (
            <Image key={src} src={src} alt="Detailing showcase" width={640} height={420} className="h-64 w-full rounded-2xl object-cover" />
          ))}
        </div>
      </section>

      <section className="section-shell grid gap-6 md:grid-cols-3">
        {testimonials.map((item) => (
          <div key={item.name} className="card">
            <p className="text-white/80">“{item.quote}”</p>
            <p className="mt-3 text-sm text-brand-blue">— {item.name}</p>
          </div>
        ))}
      </section>

      <section className="section-shell grid gap-6 lg:grid-cols-2">
        <div className="card">
          <h3 className="text-2xl font-semibold">Service Area & Hours</h3>
          <p className="mt-3 text-white/75">Dallas, Fort Worth, Plano, Frisco, McKinney, Arlington</p>
          <p className="mt-2 text-white/75">Mon–Sat: 9:00 AM – 6:00 PM • Sunday: Closed</p>
        </div>
        <div className="card">
          <h3 className="text-2xl font-semibold">FAQ</h3>
          <ul className="mt-3 space-y-2 text-white/75">
            <li>Most appointments take 90–240 minutes depending on package.</li>
            <li>We bring water/electric alternatives when needed.</li>
            <li>Cancelations require 24-hour notice.</li>
          </ul>
        </div>
      </section>
    </>
  );
}
