import { BookingForm } from "@/components/booking-form";

export default function BookPage() {
  return (
    <section className="section-shell max-w-3xl">
      <h1 className="text-4xl font-bold">Book Your Appointment</h1>
      <p className="mt-3 text-white/70">Serving Cypress and the Houston area. Live slots update from our booking calendar.</p>
      <div className="mt-8">
        <BookingForm />
      </div>
    </section>
  );
}
