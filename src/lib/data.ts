import { Addon, Service } from "@/lib/types";

export const defaultServices: Service[] = [
  {
    id: "11111111-1111-1111-1111-111111111111",
    name: "Interior Detail",
    description: "Deep clean of seats, carpets, dashboard, and interior surfaces.",
    base_price_cents: 16000,
    duration_minutes: 120
  },
  {
    id: "22222222-2222-2222-2222-222222222222",
    name: "Exterior Detail",
    description: "Foam wash, decontamination, hand dry, and premium wax seal.",
    base_price_cents: 14000,
    duration_minutes: 90
  },
  {
    id: "33333333-3333-3333-3333-333333333333",
    name: "Full Detail",
    description: "Complete interior + exterior transformation with paint-safe products.",
    base_price_cents: 26000,
    duration_minutes: 210
  },
  {
    id: "44444444-4444-4444-4444-444444444444",
    name: "Ceramic Coating Prep",
    description: "Single-stage correction and coating prep consultation package.",
    base_price_cents: 32000,
    duration_minutes: 240
  }
];

export const defaultAddons: Addon[] = [
  { id: "aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1", name: "Pet Hair Removal", price_cents: 3500, extra_minutes: 30 },
  { id: "aaaaaaa2-aaaa-aaaa-aaaa-aaaaaaaaaaa2", name: "Stain Extraction", price_cents: 4000, extra_minutes: 30 },
  { id: "aaaaaaa3-aaaa-aaaa-aaaa-aaaaaaaaaaa3", name: "Engine Bay Detail", price_cents: 3000, extra_minutes: 20 },
  { id: "aaaaaaa4-aaaa-aaaa-aaaa-aaaaaaaaaaa4", name: "Odor Treatment", price_cents: 2500, extra_minutes: 20 }
];

export const testimonials = [
  { name: "Monica R.", quote: "My SUV looked better than the day I bought it. Flawless service." },
  { name: "Caleb T.", quote: "On-time, professional, and truly luxury-level detailing." },
  { name: "Jasmine P.", quote: "Booking was easy and the team communicated every step." }
];
