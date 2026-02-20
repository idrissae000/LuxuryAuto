"use client";

import { useEffect, useMemo, useState } from "react";
import { defaultAddons, defaultServices } from "@/lib/data";
import { formatCurrency } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { Addon, Service } from "@/lib/types";

type Slot = { start: string; label: string };

export function BookingForm() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [services, setServices] = useState<Service[]>(defaultServices);
  const [addonsCatalog, setAddonsCatalog] = useState<Addon[]>(defaultAddons);
  const [catalogSource, setCatalogSource] = useState<"database" | "fallback">("fallback");
  const [serviceId, setServiceId] = useState(defaultServices[0].id);
  const [vehicleSize, setVehicleSize] = useState("Sedan");
  const [addonIds, setAddonIds] = useState<string[]>([]);
  const [date, setDate] = useState("");
  const [slots, setSlots] = useState<Slot[]>([]);
  const [startTime, setStartTime] = useState("");
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [details, setDetails] = useState({ name: "", email: "", phone: "", address: "", notes: "" });

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/catalog");
      if (!res.ok) return;
      const json = await res.json();
      if (Array.isArray(json.services) && json.services.length > 0) {
        setServices(json.services);
        setServiceId(json.services[0].id);
      }
      if (Array.isArray(json.addons)) {
        setAddonsCatalog(json.addons);
      }
      if (json.source === "database" || json.source === "fallback") {
        setCatalogSource(json.source);
      }
    })();
  }, []);

  const service = useMemo(() => services.find((item) => item.id === serviceId) ?? services[0], [services, serviceId]);
  const addons = useMemo(() => addonsCatalog.filter((addon) => addonIds.includes(addon.id)), [addonsCatalog, addonIds]);
  const total = (service?.base_price_cents ?? 0) + addons.reduce((sum, addon) => sum + addon.price_cents, 0);

  const fetchAvailability = async () => {
    if (!date || !service) return;
    setLoadingSlots(true);
    setError(null);
    const durationMinutes = service.duration_minutes + addons.reduce((sum, addon) => sum + addon.extra_minutes, 0);

    const res = await fetch("/api/availability", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date, durationMinutes })
    });

    const json = await res.json();
    if (!res.ok) {
      setError(json.error || "Unable to load availability.");
      setSlots([]);
    } else {
      setSlots(json.slots);
    }

    setLoadingSlots(false);
  };

  const submitBooking = async () => {
    if (!service) return;
    setSubmitting(true);
    setError(null);

    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ serviceId, vehicleSize, addonIds, startTime, ...details })
    });

    const json = await res.json();
    if (!res.ok) {
      setError(json.error || "Unable to complete booking.");
      setSubmitting(false);
      return;
    }

    router.push(`/book/confirmation?id=${json.bookingId}`);
  };

  const toggleAddon = (id: string) => {
    setAddonIds((prev) => (prev.includes(id) ? prev.filter((addonId) => addonId !== id) : [...prev, id]));
  };

  const next = () => setStep((prev) => Math.min(5, prev + 1));
  const back = () => setStep((prev) => Math.max(1, prev - 1));

  return (
    <div className="card space-y-6 bg-gradient-to-b from-white/5 to-transparent">
      <div className="flex items-center justify-between text-sm text-white/70">
        <span>Step {step} of 5</span>
        <span className="rounded-full border border-brand-blue/40 px-3 py-1 text-xs text-brand-blue">
          {catalogSource === "database" ? "Live DB" : "Fallback"}
        </span>
      </div>

      {step === 1 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Choose your detail package</h2>
          <p className="text-sm text-white/60">Tip: double-click a package on desktop to instantly continue.</p>
          {services.map((item) => (
            <button
              key={item.id}
              onClick={() => setServiceId(item.id)}
              onDoubleClick={() => {
                setServiceId(item.id);
                setStep(2);
              }}
              className={`w-full rounded-xl border p-4 text-left transition ${serviceId === item.id ? "border-brand-blue bg-brand-blue/15 shadow-glow" : "border-white/10 hover:border-white/30"}`}
            >
              <p className="font-semibold">{item.name}</p>
              <p className="text-sm text-white/70">{item.duration_minutes} min • {formatCurrency(item.base_price_cents)}</p>
            </button>
          ))}
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Vehicle size</h2>
          <div className="grid gap-3 sm:grid-cols-3">
            {["Sedan", "SUV", "Truck"].map((size) => (
              <button
                key={size}
                onClick={() => setVehicleSize(size)}
                className={`rounded-xl border p-4 transition ${vehicleSize === size ? "border-brand-blue bg-brand-blue/15" : "border-white/10 hover:border-white/30"}`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Optional add-on</h2>
          {addonsCatalog.map((addon) => (
            <label key={addon.id} className="flex items-center justify-between rounded-xl border border-white/10 p-4">
              <span>{addon.name}</span>
              <span className="flex items-center gap-4 text-sm text-white/70">
                +{formatCurrency(addon.price_cents)}
                <input type="checkbox" checked={addonIds.includes(addon.id)} onChange={() => toggleAddon(addon.id)} />
              </span>
            </label>
          ))}
        </div>
      )}

      {step === 4 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Pick date & time</h2>
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="rounded-lg border border-white/20 bg-black px-3 py-2"
            />
            <button onClick={fetchAvailability} className="rounded-lg bg-brand-blue px-4 py-2 font-semibold shadow-glow">
              {loadingSlots ? "Loading..." : "Check availability"}
            </button>
          </div>
          <div className="grid gap-2 sm:grid-cols-3">
            {slots.map((slot) => (
              <button
                key={slot.start}
                onClick={() => setStartTime(slot.start)}
                className={`rounded-lg border px-3 py-2 ${startTime === slot.start ? "border-brand-blue bg-brand-blue/15" : "border-white/10"}`}
              >
                {slot.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 5 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Your details</h2>
          {[
            { key: "name", label: "Full name", type: "text" },
            { key: "phone", label: "Phone", type: "tel" },
            { key: "email", label: "Email", type: "email" },
            { key: "address", label: "Service address", type: "text" }
          ].map((field) => (
            <input
              key={field.key}
              required
              placeholder={field.label}
              type={field.type}
              value={details[field.key as keyof typeof details]}
              onChange={(e) => setDetails((prev) => ({ ...prev, [field.key]: e.target.value }))}
              className="w-full rounded-lg border border-white/20 bg-black px-3 py-2"
            />
          ))}
          <textarea
            placeholder="Notes"
            value={details.notes}
            onChange={(e) => setDetails((prev) => ({ ...prev, notes: e.target.value }))}
            className="w-full rounded-lg border border-white/20 bg-black px-3 py-2"
          />
          <div className="text-sm text-white/70">Estimated total: {formatCurrency(total)}</div>
          <button
            onClick={submitBooking}
            disabled={submitting}
            className="w-full rounded-lg bg-brand-blue px-4 py-3 font-semibold shadow-glow disabled:opacity-50"
          >
            {submitting ? "Submitting..." : "Confirm booking"}
          </button>
        </div>
      )}

      {error && <p className="text-sm text-red-400">{error}</p>}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button onClick={back} disabled={step === 1} className="rounded-lg border border-white/20 px-4 py-2 text-sm text-white/70 disabled:opacity-40">
          Back
        </button>
        {step < 5 && (
          <button
            onClick={next}
            className="rounded-xl bg-brand-blue px-6 py-3 text-sm font-semibold uppercase tracking-wide text-white shadow-glow transition hover:brightness-110"
          >
            Next Step
          </button>
        )}
      </div>
    </div>
  );
}
