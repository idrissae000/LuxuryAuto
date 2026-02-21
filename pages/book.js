import { useEffect, useMemo, useState } from "react";

const SERVICES = [
  { name: "Interior Detail", duration: 90 },
  { name: "Exterior Detail", duration: 90 },
  { name: "Full Detail", duration: 180 },
];

export default function Book() {
  const [serviceIdx, setServiceIdx] = useState(0);
  const service = SERVICES[serviceIdx];

  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [slots, setSlots] = useState([]);
  const [selectedStart, setSelectedStart] = useState("");
  const [status, setStatus] = useState("");

  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    email: "",
    notes: "",
  });

  const availabilityUrl = useMemo(() => {
    const params = new URLSearchParams({
      date,
      duration: String(service.duration),
      buffer: "15",
    });
    return `/api/availability?${params.toString()}`;
  }, [date, service.duration]);

  useEffect(() => {
    setSelectedStart("");
    setStatus("Loading available times…");
    fetch(availabilityUrl)
      .then((r) => r.json())
      .then((data) => {
        setSlots(data.available || []);
        setStatus("");
      })
      .catch(() => setStatus("Could not load times."));
  }, [availabilityUrl]);

  async function confirmBooking() {
    if (!selectedStart) return setStatus("Pick a time slot.");
    if (!form.name || !form.phone || !form.address) return setStatus("Please fill name, phone, and address.");

    setStatus("Booking…");

    const res = await fetch("/api/book", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date,
        start: selectedStart,
        duration: service.duration,
        service: service.name,
        ...form,
      }),
    });

    const data = await res.json();
    if (!res.ok) return setStatus(data.error || "Booking failed.");

    setStatus("Booked ✅ Check Google Calendar to confirm.");
  }

  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: 24, fontFamily: "system-ui, Arial" }}>
      <h1 style={{ fontSize: 34, marginBottom: 6 }}>Book a Detail</h1>
      <p style={{ marginBottom: 18 }}>
        Choose a service, pick a time, and enter your info. Everything stays on this site.
      </p>

      <div style={{ display: "grid", gap: 12, marginBottom: 18 }}>
        <label>
          <div style={{ marginBottom: 6 }}>Service</div>
          <select
            value={serviceIdx}
            onChange={(e) => setServiceIdx(Number(e.target.value))}
            style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid #ddd" }}
          >
            {SERVICES.map((s, i) => (
              <option key={s.name} value={i}>
                {s.name} ({s.duration} min)
              </option>
            ))}
          </select>
        </label>

        <label>
          <div style={{ marginBottom: 6 }}>Date</div>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid #ddd" }}
          />
        </label>
      </div>

      <h2 style={{ fontSize: 20, marginBottom: 10 }}>Available times</h2>
      {status && <p style={{ marginBottom: 10 }}>{status}</p>}

      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 22 }}>
        {slots.map((s) => (
          <button
            key={s.start}
            onClick={() => setSelectedStart(s.start)}
            style={{
              padding: "10px 14px",
              borderRadius: 12,
              border: selectedStart === s.start ? "2px solid #000" : "1px solid #ddd",
              background: "#fff",
              cursor: "pointer",
            }}
          >
            {s.start}
          </button>
        ))}
        {!slots.length && !status && <p>No times available for this date.</p>}
      </div>

      <h2 style={{ fontSize: 20, marginBottom: 10 }}>Your info</h2>
      <div style={{ display: "grid", gap: 10 }}>
        <input
          placeholder="Full name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          style={{ padding: 10, borderRadius: 10, border: "1px solid #ddd" }}
        />
        <input
          placeholder="Phone number"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          style={{ padding: 10, borderRadius: 10, border: "1px solid #ddd" }}
        />
        <input
          placeholder="Service address"
          value={form.address}
          onChange={(e) => setForm({ ...form, address: e.target.value })}
          style={{ padding: 10, borderRadius: 10, border: "1px solid #ddd" }}
        />
        <input
          placeholder="Email (optional)"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          style={{ padding: 10, borderRadius: 10, border: "1px solid #ddd" }}
        />
        <textarea
          placeholder="Notes (optional)"
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          style={{ padding: 10, borderRadius: 10, border: "1px solid #ddd", minHeight: 90 }}
        />

        <button
          onClick={confirmBooking}
          style={{
            padding: 12,
            borderRadius: 12,
            border: "1px solid #000",
            background: "#000",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          Confirm Booking
        </button>
      </div>
    </main>
  );
}
