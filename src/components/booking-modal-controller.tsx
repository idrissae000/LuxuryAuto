"use client";

import { useEffect, useState } from "react";
import { BookingForm } from "@/components/booking-form";

const OPEN_EVENT = "open-booking-modal";

type OpenBookingModalDetail = {
  serviceId?: string;
};

export function BookingModalController() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState<string | undefined>(undefined);

  useEffect(() => {
    const open = (event: Event) => {
      const customEvent = event as CustomEvent<OpenBookingModalDetail>;
      setSelectedServiceId(customEvent.detail?.serviceId);
      setIsOpen(true);
    };

    window.addEventListener(OPEN_EVENT, open);
    return () => window.removeEventListener(OPEN_EVENT, open);
  }, []);

  return (
    <BookingForm
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      selectedServiceId={selectedServiceId}
    />
  );
}
