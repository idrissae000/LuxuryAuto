export type VehicleSize = "Sedan" | "SUV" | "Truck";

export type Service = {
  id: string;
  name: string;
  description: string;
  base_price_cents: number;
  duration_minutes: number;
};

export type Addon = {
  id: string;
  name: string;
  price_cents: number;
  extra_minutes: number;
};

export type BookingStatus = "scheduled" | "in_progress" | "completed" | "canceled";
