"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BookingForm } from "@/components/booking-form";

export default function BookPage() {
  const router = useRouter();
  const [open, setOpen] = useState(true);

  const closeModal = () => {
    setOpen(false);
    router.push("/");
  };

  return (
    <section className="section-shell">
      <BookingForm isOpen={open} onClose={closeModal} />
    </section>
  );
}
