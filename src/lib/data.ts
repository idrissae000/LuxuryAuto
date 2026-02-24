import { Addon, Service } from "@/lib/types";

export const defaultServices: Service[] = [
  {
    id: "11111111-1111-1111-1111-111111111111",
    name: "Interior Detail",
    description: "Deep interior refresh: seats, carpets, dash, door panels, vents, and trim.",
    base_price_cents: 17500,
    duration_minutes: 60
  },
  {
    id: "22222222-2222-2222-2222-222222222222",
    name: "Exterior Detail",
    description: "Foam wash, hand decon, wheel/tire treatment, and premium exterior finish.",
    base_price_cents: 15500,
    duration_minutes: 60
  },
  {
    id: "33333333-3333-3333-3333-333333333333",
    name: "Full Vehicle Detail",
    description: "Complete interior + exterior service for a full vehicle reset.",
    base_price_cents: 28500,
    duration_minutes: 120
  }
];

export const defaultAddons: Addon[] = [
  { id: "aaaaaaa4-aaaa-aaaa-aaaa-aaaaaaaaaaa4", name: "Odor Removal", price_cents: 1500, extra_minutes: 15 }
];

export const faqs = [
  {
    q: "How long does a detail take?",
    a: "Interior and exterior details are typically 60 minutes, while full details are typically 120 minutes."
  },
  {
    q: "Do you service all of Texas?",
    a: "No. Service area is Houston metro with focus on Cypress and nearby neighborhoods."
  },
  {
    q: "What do I need to provide?",
    a: "Just access to the vehicle and enough space to work safely."
  },
  {
    q: "How do cancellations work?",
    a: "Please provide at least 24 hours notice when possible so we can reschedule your slot."
  }
];
