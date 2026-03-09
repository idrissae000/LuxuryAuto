import Link from "next/link";
import { BUSINESS_PHONE, BUSINESS_PHONE_TEL, BUSINESS_EMAIL, BUSINESS_INSTAGRAM, BUSINESS_INSTAGRAM_URL } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-black/70">
      <div className="section-shell grid gap-8 py-10 sm:grid-cols-2">
        <div>
          <h3 className="text-lg font-semibold">Luxury Auto Detailz</h3>
          <p className="mt-2 text-sm text-white/70">Mobile detailing in Cypress + greater Houston area.</p>
        </div>
        <div className="text-sm text-white/70 sm:text-right">
          <p>
            Call:{" "}
            <a href={`tel:${BUSINESS_PHONE_TEL}`} className="transition-colors hover:text-white">
              {BUSINESS_PHONE}
            </a>
          </p>
          <p>
            Email:{" "}
            <a href={`mailto:${BUSINESS_EMAIL}`} className="transition-colors hover:text-white">
              {BUSINESS_EMAIL}
            </a>
          </p>
          <p>
            <a
              href={BUSINESS_INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-white"
            >
              {BUSINESS_INSTAGRAM}
            </a>
          </p>
          <div className="mt-2 flex gap-3 sm:justify-end">
            <Link href="/privacy-policy" className="text-brand-blue hover:underline">Privacy Policy</Link>
            <Link href="/terms" className="text-brand-blue hover:underline">Terms &amp; Conditions</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
