"use client";

import type { ReactNode } from "react";

type BookNowButtonProps = {
  className?: string;
  children: ReactNode;
};

export function BookNowButton({ className, children }: BookNowButtonProps) {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event("open-booking-modal"))}
      className={className}
    >
      {children}
    </button>
  );
}