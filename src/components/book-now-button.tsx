import Link from "next/link";
import type { ReactNode } from "react";

type BookNowButtonProps = {
  className?: string;
  children: ReactNode;
};

export function BookNowButton({ className, children }: BookNowButtonProps) {
  return (
    <Link href="/pricing" className={className}>
      {children}
    </Link>
  );
}
