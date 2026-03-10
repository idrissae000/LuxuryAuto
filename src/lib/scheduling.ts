import { addMinutes, isBefore } from "date-fns";
import { BUSINESS_TIMEZONE, SLOT_INTERVAL_MINUTES, TRAVEL_BUFFER_MINUTES, WORKING_HOURS } from "@/lib/constants";

export type CandidateSlot = { start: Date; end: Date; busyCheckEnd: Date };

const toUtcFromBusinessLocal = (dateIso: string, hm: string) => {
  const [hour, minute] = hm.split(":").map(Number);
  // Parse date components directly from the ISO string to avoid timezone
  // shifting.  Previously, parse() produced midnight UTC which
  // businessDateParts() converted to the prior day in America/Chicago.
  const [year, month, day] = dateIso.split("-").map(Number);

  const utcGuess = new Date(Date.UTC(year, month - 1, day, hour, minute, 0, 0));
  const rendered = new Intl.DateTimeFormat("en-US", {
    timeZone: BUSINESS_TIMEZONE,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).formatToParts(utcGuess);

  const renderedYear = Number(rendered.find((p) => p.type === "year")?.value ?? "0");
  const renderedMonth = Number(rendered.find((p) => p.type === "month")?.value ?? "0");
  const renderedDay = Number(rendered.find((p) => p.type === "day")?.value ?? "0");
  const renderedHour = Number(rendered.find((p) => p.type === "hour")?.value ?? "0");
  const renderedMinute = Number(rendered.find((p) => p.type === "minute")?.value ?? "0");

  const renderedAsUtcMs = Date.UTC(renderedYear, renderedMonth - 1, renderedDay, renderedHour, renderedMinute, 0, 0);
  const targetAsUtcMs = Date.UTC(year, month - 1, day, hour, minute, 0, 0);
  return new Date(utcGuess.getTime() + (targetAsUtcMs - renderedAsUtcMs));
};

export const getDayWindow = (dateIso: string) => {
  const [year, month, day] = dateIso.split("-").map(Number);
  const weekdayLabel = new Intl.DateTimeFormat("en-US", {
    timeZone: BUSINESS_TIMEZONE,
    weekday: "short"
  }).format(new Date(Date.UTC(year, month - 1, day, 12, 0, 0)));

  const weekdayMap: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6
  };

  const schedule = WORKING_HOURS[weekdayMap[weekdayLabel]];
  if (!schedule) return null;

  return {
    start: toUtcFromBusinessLocal(dateIso, schedule.start),
    end: toUtcFromBusinessLocal(dateIso, schedule.end)
  };
};

export const generateCandidateSlots = (dateIso: string, durationMinutes: number): CandidateSlot[] => {
  const window = getDayWindow(dateIso);
  if (!window) return [];

  const slots: CandidateSlot[] = [];
  let cursor = new Date(window.start);

  // The closing time is the latest allowed START time (not END time).
  // Services may extend past the closing time.
  while (isBefore(cursor, addMinutes(window.end, 1))) {
    const end = addMinutes(cursor, durationMinutes);
    slots.push({ start: new Date(cursor), end, busyCheckEnd: addMinutes(end, TRAVEL_BUFFER_MINUTES) });
    cursor = addMinutes(cursor, SLOT_INTERVAL_MINUTES);
  }

  return slots;
};
