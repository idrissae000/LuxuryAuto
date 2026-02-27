"use client";

import { useEffect, useState } from "react";
import { BookingForm } from "@/components/booking-form";

const OPEN_EVENT = "open-booking-modal";

export function BookingModalController() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const open = () => setIsOpen(true);
    window.addEventListener(OPEN_EVENT, open);
    return () => window.removeEventListener(OPEN_EVENT, open);
  }, []);

  return <BookingForm isOpen={isOpen} onClose={() => setIsOpen(false)} />;
}
