import { BookingForm } from "@/components/booking-form";

export default function BookPage() {
  return (
    <section className="section-shell max-w-3xl">
      <h1 className="text-4xl font-bold">Book Your Appointment</h1>
      <p className="mt-3 text-white/70">Only available times are shown based on our live Google Calendar.</p>
      <div className="mt-8">
        <BookingForm />
      </div>
    </section>
  );
}
