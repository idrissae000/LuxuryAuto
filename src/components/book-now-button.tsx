"use client";

import type { ReactNode } from "react";

type BookNowButtonProps = {
  className?: string;
  children: ReactNode;
  serviceId?: string;
};

export function BookNowButton({ className, children, serviceId }: BookNowButtonProps) {
  return (
    <button
      type="button"
      onClick={() =>
        window.dispatchEvent(
          new CustomEvent("open-booking-modal", {
            detail: { serviceId }
          })
        )
      }
      className={className}
    >
      {children}
    </button>
  );
}
