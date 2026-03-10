import { Addon, Service } from "@/lib/types";

export const defaultServices: Service[] = [
  {
    id: "11111111-1111-1111-1111-111111111111",
    name: "Interior Detail",
    description: "Deep interior refresh: seats, carpets, dash, door panels, vents, and trim.",
    base_price_cents: 4500,
    duration_minutes: 60
  },
  {
    id: "22222222-2222-2222-2222-222222222222",
    name: "Exterior Detail",
    description: "Foam wash, hand decon, wheel/tire treatment, and premium exterior finish.",
    base_price_cents: 4500,
    duration_minutes: 60
  },
  {
    id: "33333333-3333-3333-3333-333333333333",
    name: "Full Detail",
    description: "Complete interior + exterior service for a full vehicle reset.",
    base_price_cents: 8000,
    duration_minutes: 120
  }
];

export const defaultAddons: Addon[] = [
  {
    id: "addon-clay-seal",
    name: "Clay and Seal Paint Treatment",
    price_cents: 5000,
    extra_minutes: 0
  },
  {
    id: "addon-leather-conditioner",
    name: "Leather Conditioner",
    price_cents: 3000,
    extra_minutes: 0
  },
  {
    id: "addon-shampoo",
    name: "Shampoo",
    price_cents: 3000,
    extra_minutes: 0
  },
  {
    id: "addon-headlight-restoration",
    name: "Headlight Restoration",
    price_cents: 7500,
    extra_minutes: 0
  },
  {
    id: "addon-water-spot-removal",
    name: "Water Spot Removal",
    price_cents: 7500,
    extra_minutes: 0
  }
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
