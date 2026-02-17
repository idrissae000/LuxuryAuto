export const BUSINESS_NAME = "Luxury Auto Detailz";
export const BUSINESS_TIMEZONE = process.env.BUSINESS_TIMEZONE ?? "America/Chicago";
export const SLOT_INTERVAL_MINUTES = Number(process.env.SLOT_INTERVAL_MINUTES ?? 30);
export const TRAVEL_BUFFER_MINUTES = Number(process.env.TRAVEL_BUFFER_MINUTES ?? 30);

export const WORKING_HOURS: Record<number, { start: string; end: string } | null> = {
  0: null,
  1: { start: "09:00", end: "18:00" },
  2: { start: "09:00", end: "18:00" },
  3: { start: "09:00", end: "18:00" },
  4: { start: "09:00", end: "18:00" },
  5: { start: "09:00", end: "18:00" },
  6: { start: "09:00", end: "18:00" }
};

export const VEHICLE_SIZES = ["Sedan", "SUV", "Truck"] as const;
