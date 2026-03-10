"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { defaultServices, defaultAddons } from "@/lib/data";
import { formatCurrency } from "@/lib/utils";
import { Addon, Service } from "@/lib/types";
import { getServiceDurationMinutes } from "@/lib/constants";
import { LogoImage } from "@/components/logo-image";

type Slot = { start: string; label: string };

type BookingFormProps = {
  isOpen: boolean;
  onClose: () => void;
  selectedServiceId?: string;
};

export function BookingForm({ isOpen, onClose, selectedServiceId }: BookingFormProps) {
  const router = useRouter();
  const [services, setServices] = useState<Service[]>(defaultServices);
  const [addons, setAddons] = useState<Addon[]>(defaultAddons);
  const [selectedAddonIds, setSelectedAddonIds] = useState<Set<string>>(new Set());
  const [serviceId, setServiceId] = useState(defaultServices[0].id);
  const [date, setDate] = useState("");
  const [slots, setSlots] = useState<Slot[]>([]);
  const [startTime, setStartTime] = useState("");
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [details, setDetails] = useState({ name: "", phone: "", address: "", email: "", notes: "" });

  const formatPhoneNumber = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 10);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 3)})-${digits.slice(3)}`;
    return `(${digits.slice(0, 3)})-${digits.slice(3, 6)}-${digits.slice(6)}`;
  };

  useEffect(() => {
    if (isOpen && selectedServiceId) {
      setServiceId(selectedServiceId);
      setStartTime("");
    }
  }, [isOpen, selectedServiceId]);

  useEffect(() => {
    if (!isOpen) return;

    (async () => {
      const res = await fetch("/api/catalog/");
      if (!res.ok) return;
      const json = await res.json();
      if (Array.isArray(json.services) && json.services.length > 0) {
        setServices(json.services);
        setServiceId((prev) => {
          if (selectedServiceId && json.services.some((service: Service) => service.id === selectedServiceId)) {
            return selectedServiceId;
          }
          if (json.services.some((service: Service) => service.id === prev)) {
            return prev;
          }
          return json.services[0].id;
        });
      }
      if (Array.isArray(json.addons) && json.addons.length > 0) {
        setAddons(json.addons);
      }
    })();
  }, [isOpen, selectedServiceId]);

  const selectedService = useMemo(
    () => services.find((service) => service.id === serviceId) ?? services[0],
    [serviceId, services]
  );

  const normalizedPhone = details.phone;
  const serviceDuration = selectedService
    ? getServiceDurationMinutes(selectedService.name, selectedService.duration_minutes)
    : 90;

  const toggleAddon = (id: string) => {
    setSelectedAddonIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectedAddons = addons.filter((a) => selectedAddonIds.has(a.id));
  const addonsTotalCents = selectedAddons.reduce((sum, a) => sum + a.price_cents, 0);
  const totalCents = (selectedService?.base_price_cents ?? 0) + addonsTotalCents;

  useEffect(() => {
    if (!date || !selectedService || !isOpen) {
      setSlots([]);
      setStartTime("");
      return;
    }

    const controller = new AbortController();

    const load = async () => {
      setLoadingSlots(true);
      setError(null);
      const res = await fetch("/api/availability/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, serviceId: selectedService.id, serviceName: selectedService.name }),
        signal: controller.signal
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

    load().catch(() => {
      if (!controller.signal.aborted) {
        setError("Unable to load availability.");
        setLoadingSlots(false);
      }
    });

    return () => controller.abort();
  }, [date, selectedService, isOpen]);

  // Close on ESC key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll while modal is open
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [isOpen]);

  if (!isOpen) return null;

  const canSubmit = Boolean(
    selectedService &&
      date &&
      startTime &&
      details.name.trim().length >= 2 &&
      /^\d{10}$/.test(normalizedPhone) &&
      details.address.trim().length >= 5
  );

  const submitBooking = async () => {
    if (!selectedService || !canSubmit) return;
    setSubmitting(true);
    setError(null);

    const res = await fetch("/api/bookings/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        serviceId,
        serviceName: selectedService.name,
        date,
        startTime,
        name: details.name.trim(),
        phone: normalizedPhone,
        email: details.email.trim(),
        address: details.address.trim(),
        notes: details.notes.trim(),
        addons: selectedAddons.map((a) => ({ id: a.id, name: a.name, price_cents: a.price_cents }))
      })
    });

    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      if (res.status === 409) {
        setStartTime("");
        setError("That slot was just taken. Pick another time.");
      } else {
        setError(json.error || "Unable to complete booking.");
      }
      setSubmitting(false);
      return;
    }

    onClose();

    const confirmParams = new URLSearchParams({
      id: json.bookingId ?? "",
      name: details.name.trim(),
      service: selectedService.name,
      date,
      time: startTime,
      address: details.address.trim(),
    });
    if (selectedAddons.length > 0) {
      confirmParams.set("addons", selectedAddons.map((a) => `${a.name}|${a.price_cents}`).join(","));
    }
    router.push(`/book/confirmation?${confirmParams.toString()}`);
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="presentation">
      <div className="modal-panel" onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true" aria-label="Book appointment">
        <button
          onClick={onClose}
          className="absolute right-3 top-3 rounded-full border border-white/20 bg-black/60 p-2 text-white/80 transition hover:text-white"
          aria-label="Close booking"
        >
          <X size={18} />
        </button>

        <div className="mb-4 flex items-center gap-3 pr-10">
          <LogoImage alt="Luxury Auto Detailz" width={44} height={44} className="rounded-full" />
          <div>
            <h2 className="text-2xl font-semibold">Book an Appointment</h2>
            <p className="text-sm text-white/70">Availability and bookings are powered by Google Calendar.</p>
          </div>
        </div>

        <div className="soft-rise space-y-4">
          <p className="text-xs text-white/50">
            Name, phone number, and address are required to schedule your appointment.
          </p>

          <label className="space-y-2 text-sm text-white/80">
            Service
            <select
              value={serviceId}
              onChange={(event) => {
                setServiceId(event.target.value);
                setStartTime("");
              }}
              className="w-full rounded-xl border border-white/20 bg-black/60 px-3 py-3"
            >
              {services.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.name} ({getServiceDurationMinutes(service.name, service.duration_minutes)} min)
                </option>
              ))}
            </select>
          </label>

          {addons.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm text-white/80">Add-Ons <span className="text-white/50">(optional)</span></p>
              <div className="grid gap-2 sm:grid-cols-2">
                {addons.map((addon) => (
                  <label
                    key={addon.id}
                    className={`flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2.5 text-sm transition ${
                      selectedAddonIds.has(addon.id)
                        ? "border-brand-blue bg-brand-blue/10 shadow-glow"
                        : "border-white/20 bg-black/50 hover:border-white/40"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedAddonIds.has(addon.id)}
                      onChange={() => toggleAddon(addon.id)}
                      className="sr-only"
                    />
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border text-xs ${
                        selectedAddonIds.has(addon.id)
                          ? "border-brand-blue bg-brand-blue text-white"
                          : "border-white/30 bg-black/40"
                      }`}
                    >
                      {selectedAddonIds.has(addon.id) && "✓"}
                    </span>
                    <span className="flex-1">{addon.name}</span>
                    <span className="shrink-0 text-white/60">{formatCurrency(addon.price_cents)}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <label className="space-y-2 text-sm text-white/80">
            Appointment date
            <input
              type="date"
              value={date}
              min={new Date().toISOString().slice(0, 10)}
              onChange={(event) => {
                setDate(event.target.value);
                setStartTime("");
              }}
              className="w-full rounded-xl border border-white/20 bg-black/60 px-3 py-3"
            />
          </label>

          <div className="space-y-2">
            <p className="text-sm text-white/80">Available times</p>
            {loadingSlots && <p className="text-sm text-white/60">Loading available times...</p>}
            {!loadingSlots && date && slots.length === 0 && <p className="text-sm text-white/60">No slots available for this date.</p>}
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {slots.map((slot) => (
                <button
                  key={slot.start}
                  onClick={() => setStartTime(slot.start)}
                  className={`rounded-xl border px-3 py-2 text-sm transition ${startTime === slot.start ? "border-brand-blue bg-brand-blue/20 shadow-glow" : "border-white/20 bg-black/50 hover:border-white/40"}`}
                >
                  {slot.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm text-white/80">
                Name <span className="text-red-400">*</span>
              </label>
              <input
                required
                placeholder="Full name"
                value={details.name}
                onChange={(event) => setDetails((prev) => ({ ...prev, name: event.target.value }))}
                className="w-full rounded-xl border border-white/20 bg-black/60 px-3 py-3"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-white/80">
                Phone Number <span className="text-red-400">*</span>
              </label>
              <input
                required
                placeholder="Phone (10 digits)"
                value={formatPhoneNumber(details.phone)}
                inputMode="numeric"
                maxLength={14}
                onChange={(event) =>
                  setDetails((prev) => ({ ...prev, phone: event.target.value.replace(/\D/g, "").slice(0, 10) }))
                }
                className="w-full rounded-xl border border-white/20 bg-black/60 px-3 py-3"
              />
              <p className="mt-1 text-xs text-white/50">
                By providing your phone number, you agree to receive appointment confirmations and reminders via SMS
                from Luxury Auto Detailz. Message and data rates may apply. Reply STOP to unsubscribe.
              </p>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm text-white/80">
              Address <span className="text-red-400">*</span>
            </label>
            <input
              required
              placeholder="Service address"
              value={details.address}
              onChange={(event) => setDetails((prev) => ({ ...prev, address: event.target.value }))}
              className="w-full rounded-xl border border-white/20 bg-black/60 px-3 py-3"
            />
          </div>

          <input
            placeholder="Email (optional)"
            type="email"
            value={details.email}
            onChange={(event) => setDetails((prev) => ({ ...prev, email: event.target.value }))}
            className="w-full rounded-xl border border-white/20 bg-black/60 px-3 py-3"
          />

          <textarea
            placeholder="Notes (optional)"
            value={details.notes}
            onChange={(event) => setDetails((prev) => ({ ...prev, notes: event.target.value }))}
            className="w-full rounded-xl border border-white/20 bg-black/60 px-3 py-3"
          />

          <div className="space-y-1 text-sm text-white/70">
            <div className="flex items-center justify-between">
              <span>{serviceDuration} minute service</span>
              <span>{selectedService ? formatCurrency(selectedService.base_price_cents) : "—"}</span>
            </div>
            {selectedAddons.length > 0 && (
              <>
                {selectedAddons.map((a) => (
                  <div key={a.id} className="flex items-center justify-between text-white/50">
                    <span>{a.name}</span>
                    <span>{formatCurrency(a.price_cents)}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between border-t border-white/10 pt-1 font-semibold text-white/90">
                  <span>Total</span>
                  <span>{formatCurrency(totalCents)}</span>
                </div>
              </>
            )}
            <p className="mt-2 text-xs text-white/50">
              Payment is collected after the service is completed.
            </p>
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button
            onClick={submitBooking}
            disabled={submitting || !canSubmit}
            className="btn-primary w-full rounded-xl px-4 py-3 font-semibold disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? "Booking..." : "Confirm appointment"}
          </button>
        </div>
      </div>
    </div>
  );
}
