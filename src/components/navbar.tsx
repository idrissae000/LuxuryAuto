import Link from "next/link";

const links = [
  { href: "/", label: "Home" },
  { href: "/pricing", label: "Pricing" },
  { href: "/gallery", label: "Gallery" },
  { href: "/contact", label: "Contact" }
];

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/80 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <picture>
            <source srcSet="/logo.png" type="image/png" />
            <img src="/logo.svg" alt="Luxury Auto Detailz" width={42} height={42} className="rounded-full" />
          </picture>
          <span className="text-sm font-semibold uppercase tracking-[0.2em]">Luxury Auto Detailz</span>
        </Link>
        <div className="flex items-center gap-5 text-sm">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="hidden text-white/80 transition hover:text-white md:block">
              {link.label}
            </Link>
          ))}
          <Link
            href="/book"
            className="rounded-full bg-brand-blue px-4 py-2 font-semibold text-white shadow-glow transition hover:brightness-110"
          >
            Book Now
          </Link>
        </div>
      </nav>
    </header>
  );
}
