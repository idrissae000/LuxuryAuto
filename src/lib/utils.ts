import { format } from "date-fns";
import { BUSINESS_TIMEZONE } from "@/lib/constants";
import { BusyWindow } from "@/lib/booking-conflicts";

export const formatCurrency = (cents: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);

export const toLocalLabel = (date: Date) =>
  new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", timeZone: BUSINESS_TIMEZONE }).format(date);

export const intersects = (
  slot: { start: Date; busyCheckEnd: Date },
  busy: BusyWindow[]
) => {
  return busy.some((event) => {
    const busyStart = new Date(event.start);
    const busyEnd = new Date(event.end);
    return slot.start < busyEnd && slot.busyCheckEnd > busyStart;
  });
};

export const formatDateTime = (date: string) => format(new Date(date), "PPP p");
