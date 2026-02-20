"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { faqs } from "@/lib/data";

export default function ContactPage() {
  const [sent, setSent] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const payload = Object.fromEntries(formData.entries());
    await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    setSent(true);
  }

  return (
    <section className="section-shell space-y-8">
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="card">
          <h1 className="text-4xl font-bold">Contact</h1>
          <p className="mt-4 text-white/70">Call, text, or send us a message for mobile detailing in Houston and Cypress.</p>
          <div className="mt-6 space-y-2 text-white/80">
            <a className="block" href="tel:+18325550113">📞 (832) 555-0113</a>
            <a className="block" href="mailto:hello@luxuryautodetailz.com">✉️ hello@luxuryautodetailz.com</a>
            <p>Hours: Mon–Sat 9:00 AM – 6:00 PM</p>
            <p>Service Area: Cypress, Houston, Jersey Village, Tomball, Katy</p>
          </div>
        </div>
        <form onSubmit={submit} className="card space-y-3">
          <input name="name" required placeholder="Name" className="w-full rounded-lg border border-white/20 bg-black px-3 py-2" />
          <input name="email" required placeholder="Email" type="email" className="w-full rounded-lg border border-white/20 bg-black px-3 py-2" />
          <textarea name="message" required placeholder="How can we help?" className="w-full rounded-lg border border-white/20 bg-black px-3 py-2" />
          <button className="rounded-lg bg-brand-blue px-4 py-2 font-semibold">Send</button>
          {sent && <p className="text-sm text-brand-blue">Message sent.</p>}
          <p className="text-xs text-white/60">
            By contacting us you agree to our <Link href="/terms" className="text-brand-blue">Terms of Service</Link>.
          </p>
        </form>
      </div>

      <div className="card">
        <h2 className="text-2xl font-semibold">Frequently Asked Questions</h2>
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
  );
}
