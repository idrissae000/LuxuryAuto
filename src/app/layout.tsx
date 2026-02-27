import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { BookingModalController } from "@/components/booking-modal-controller";

export const metadata: Metadata = {
  title: "Luxury Auto Detailz",
  description: "Luxury mobile car detailing in Texas"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <main>{children}</main>
        <Footer />
        <BookingModalController />
      </body>
    </html>
  );
}
