export const BUSINESS_NAME = "Luxury Auto Detailz";
export const BUSINESS_PHONE = "281-716-7524";
export const BUSINESS_PHONE_TEL = "+12817167524";
export const BUSINESS_EMAIL = "tahaehab1977@gmail.com";
export const BUSINESS_INSTAGRAM = "@luxury_auto_detailz3";
export const BUSINESS_INSTAGRAM_URL = "https://www.instagram.com/luxury_auto_detailz3/";
export const BUSINESS_TIMEZONE = process.env.BOOKING_TZ ?? process.env.BUSINESS_TIMEZONE ?? "America/Chicago";
export const SLOT_INTERVAL_MINUTES = Number(process.env.SLOT_INTERVAL_MINUTES ?? 30);
export const TRAVEL_BUFFER_MINUTES = Number(process.env.TRAVEL_BUFFER_MINUTES ?? 15);

export const WORKING_HOURS: Record<number, { start: string; end: string } | null> = {
  0: { start: "07:00", end: "17:00" },
  1: { start: "15:00", end: "20:00" },
  2: { start: "15:00", end: "20:00" },
  3: { start: "15:00", end: "20:00" },
  4: { start: "15:00", end: "20:00" },
  5: { start: "15:00", end: "20:00" },
  6: { start: "07:00", end: "17:00" }
};

const SERVICE_DURATION_OVERRIDES: Record<string, number> = {
  "Interior Detail": 60,
  "Exterior Detail": 60,
  "Full Vehicle Detail": 120,
  "Full Detail": 120
};

export const getServiceDurationMinutes = (serviceName: string, fallbackDuration: number) =>
  SERVICE_DURATION_OVERRIDES[serviceName] ?? fallbackDuration;
