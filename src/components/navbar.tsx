"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { BookNowButton } from "@/components/book-now-button";
import { LogoImage } from "@/components/logo-image";

const links = [
  { href: "/", label: "Home" },
  { href: "/pricing", label: "Pricing" },
  { href: "/gallery", label: "Gallery" },
  { href: "/contact", label: "Contact" }
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/80 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <LogoImage alt="Luxury Auto Detailz" width={42} height={42} className="rounded-full" />
          <span className="text-sm font-semibold uppercase tracking-[0.2em]">Luxury Auto Detailz</span>
        </Link>
        <div className="flex items-center gap-5 text-sm">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`nav-link hidden md:block ${pathname === link.href ? "text-white" : "text-white/70"}`}
            >
              {link.label}
            </Link>
          ))}
          <BookNowButton className="btn-primary rounded-full px-4 py-2 font-semibold text-white">
            Book Now
          </BookNowButton>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/15 text-white/80 transition hover:text-white md:hidden"
            aria-label="Toggle menu"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              {mobileOpen ? (
                <>
                  <line x1="5" y1="5" x2="15" y2="15" />
                  <line x1="15" y1="5" x2="5" y2="15" />
                </>
              ) : (
                <>
                  <line x1="3" y1="6" x2="17" y2="6" />
                  <line x1="3" y1="10" x2="17" y2="10" />
                  <line x1="3" y1="14" x2="17" y2="14" />
                </>
              )}
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile slide-out menu */}
      <div
        className={`mobile-menu-overlay md:hidden ${mobileOpen ? "open" : ""}`}
        onClick={() => setMobileOpen(false)}
      >
        <div
          className={`mobile-menu-panel ${mobileOpen ? "open" : ""}`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex flex-col gap-1 p-4">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-xl px-4 py-3 text-lg font-medium transition-colors ${pathname === link.href ? "bg-brand-blue/15 text-brand-blue" : "text-white/80 hover:bg-white/5 hover:text-white"}`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
