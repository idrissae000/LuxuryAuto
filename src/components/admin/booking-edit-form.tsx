"use client";

import { useState } from "react";

export function BookingEditForm({
  bookingId,
  initialStatus,
  initialInternalNotes,
  initialAssignedTech,
  initialFinalTotalCents
}: {
  bookingId: string;
  initialStatus: string;
  initialInternalNotes: string;
  initialAssignedTech: string;
  initialFinalTotalCents: number | null;
}) {
  const [status, setStatus] = useState(initialStatus);
  const [internalNotes, setInternalNotes] = useState(initialInternalNotes);
  const [assignedTech, setAssignedTech] = useState(initialAssignedTech);
  const [finalTotalCents, setFinalTotalCents] = useState(initialFinalTotalCents?.toString() ?? "");
  const [message, setMessage] = useState<string | null>(null);

  const save = async () => {
    setMessage(null);
    const res = await fetch(`/api/admin/bookings/${bookingId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status,
        internal_notes: internalNotes,
        assigned_tech: assignedTech,
        final_total_cents: finalTotalCents ? Number(finalTotalCents) : null
      })
    });

    const json = await res.json();
    if (!res.ok) {
      setMessage(json.error ?? "Unable to save changes.");
      return;
    }

    setMessage("Saved.");
  };

  return (
    <div className="mt-6 card space-y-3">
      <h2 className="text-xl font-semibold">Edit Booking</h2>
      <label className="text-sm text-white/70">Status</label>
      <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-lg border border-white/20 bg-black px-3 py-2">
        {[
          { value: "scheduled", label: "Scheduled" },
          { value: "in_progress", label: "In Progress" },
          { value: "completed", label: "Completed" },
          { value: "canceled", label: "Canceled" }
        ].map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <label className="text-sm text-white/70">Assigned Tech</label>
      <input
        value={assignedTech}
        onChange={(e) => setAssignedTech(e.target.value)}
        className="rounded-lg border border-white/20 bg-black px-3 py-2"
      />

      <label className="text-sm text-white/70">Final Total (cents)</label>
      <input
        type="number"
        min={0}
        value={finalTotalCents}
        onChange={(e) => setFinalTotalCents(e.target.value)}
        className="rounded-lg border border-white/20 bg-black px-3 py-2"
      />

      <label className="text-sm text-white/70">Internal Notes</label>
      <textarea
        value={internalNotes}
        onChange={(e) => setInternalNotes(e.target.value)}
        className="rounded-lg border border-white/20 bg-black px-3 py-2"
      />

      <button onClick={save} className="rounded-lg bg-brand-blue px-4 py-2 font-semibold">
        Save Changes
      </button>

      {message && <p className="text-sm text-brand-blue">{message}</p>}
    </div>
  );
}
