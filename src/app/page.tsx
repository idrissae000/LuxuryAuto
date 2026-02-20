import Image from "next/image";
import Link from "next/link";
import { defaultServices, faqs } from "@/lib/data";
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
            <p className="text-sm uppercase tracking-[0.3em] text-brand-blue">Houston Mobile Detailing</p>
            <h1 className="mt-3 text-4xl font-bold sm:text-6xl">Luxury Auto Detailz</h1>
            <p className="mt-4 max-w-xl text-white/75">
              Premium mobile detailing based in Cypress, Texas. Clean finish, clear communication, and reliable appointments.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/book" className="rounded-full bg-brand-blue px-6 py-3 font-semibold shadow-glow">Book Now</Link>
              <Link href="/pricing" className="rounded-full border border-white/20 px-6 py-3 font-semibold">View Pricing</Link>
            </div>
          </div>
          <div className="card bg-gradient-to-br from-brand-slate to-black">
            <Image src="/logo.svg" alt="Luxury Auto Detailz logo" width={480} height={480} className="mx-auto rounded-3xl" />
          </div>
        </div>
      </section>

      <section className="section-shell">
        <h2 className="text-3xl font-semibold">Detail Packages</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {defaultServices.map((service) => (
            <article key={service.id} className="card bg-gradient-to-b from-white/5 to-transparent">
              <h3 className="text-xl font-semibold">{service.name}</h3>
              <p className="mt-2 text-sm text-white/70">{service.description}</p>
              <p className="mt-4 text-sm text-brand-blue">
                From {formatCurrency(service.base_price_cents)} • {service.duration_minutes} min
              </p>
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

      <section className="section-shell grid gap-6 lg:grid-cols-2">
        <div className="card">
          <h3 className="text-2xl font-semibold">Service Area & Hours</h3>
          <p className="mt-3 text-white/75">Houston Metro • Cypress • Jersey Village • Tomball • Katy</p>
          <p className="mt-2 text-white/75">Mon–Sat: 9:00 AM – 6:00 PM • Sunday: Closed</p>
        </div>
        <div className="card">
          <h3 className="text-2xl font-semibold">FAQ</h3>
          <div className="mt-4 space-y-3">
            {faqs.map((item) => (
              <details key={item.q} className="rounded-xl border border-white/10 bg-black/40 p-4">
                <summary className="cursor-pointer font-medium">{item.q}</summary>
                <p className="mt-2 text-sm text-white/75">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
