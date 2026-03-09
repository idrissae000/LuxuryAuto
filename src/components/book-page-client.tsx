"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BookingForm } from "@/components/booking-form";

type BookPageClientProps = {
  selectedServiceId?: string;
};

export function BookPageClient({ selectedServiceId }: BookPageClientProps) {
  const router = useRouter();
  const [open, setOpen] = useState(true);

  const closeModal = () => {
    setOpen(false);
    router.push("/");
  };

  return <BookingForm isOpen={open} onClose={closeModal} selectedServiceId={selectedServiceId} />;
}
