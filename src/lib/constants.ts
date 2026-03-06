export const BUSINESS_NAME = "Luxury Auto Detailz";
export const BUSINESS_TIMEZONE = process.env.BOOKING_TZ ?? process.env.BUSINESS_TIMEZONE ?? "America/Chicago";
export const SLOT_INTERVAL_MINUTES = Number(process.env.SLOT_INTERVAL_MINUTES ?? 30);
export const TRAVEL_BUFFER_MINUTES = Number(process.env.TRAVEL_BUFFER_MINUTES ?? 15);

export const WORKING_HOURS: Record<number, { start: string; end: string } | null> = {
  0: null,
  1: { start: "09:00", end: "18:00" },
  2: { start: "09:00", end: "18:00" },
  3: { start: "09:00", end: "18:00" },
  4: { start: "09:00", end: "18:00" },
  5: { start: "09:00", end: "18:00" },
  6: { start: "09:00", end: "18:00" }
};

const SERVICE_DURATION_OVERRIDES: Record<string, number> = {
  "Interior Detail": 90,
  "Exterior Detail": 90,
  "Full Vehicle Detail": 180,
  "Full Detail": 180
};

export const getServiceDurationMinutes = (serviceName: string, fallbackDuration: number) =>
  SERVICE_DURATION_OVERRIDES[serviceName] ?? fallbackDuration;
