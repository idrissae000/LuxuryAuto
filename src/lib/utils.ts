import { format } from "date-fns";
import { BUSINESS_TIMEZONE } from "@/lib/constants";
import { BusyWindow } from "@/lib/booking-conflicts";

type BusyLike = BusyWindow | { start?: string | null; end?: string | null };

export const formatCurrency = (cents: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);

export const toLocalLabel = (date: Date) =>
  new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", timeZone: BUSINESS_TIMEZONE }).format(date);

export const intersects = (
  slot: { start: Date; busyCheckEnd: Date },
  busy: BusyLike[]
) => {
  return busy.some((event) => {
    const start = typeof event.start === "string" ? event.start : null;
    const end = typeof event.end === "string" ? event.end : null;
    if (!start || !end) return false;

    const busyStart = new Date(start);
    const busyEnd = new Date(end);
    return slot.start < busyEnd && slot.busyCheckEnd > busyStart;
  });
};

export const formatDateTime = (date: string) => format(new Date(date), "PPP p");
