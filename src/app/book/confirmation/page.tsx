export default async function BookingConfirmationPage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const params = await searchParams;

  return (
    <section className="section-shell max-w-2xl">
      <div className="card">
        <h1 className="text-3xl font-bold">Booking Confirmed</h1>
        <p className="mt-3 text-white/75">Thank you for booking Luxury Auto Detailz. We sent your confirmation details.</p>
        <p className="mt-4 text-sm text-brand-blue">Reference ID: {params.id ?? "N/A"}</p>
      </div>
    </section>
  );
}
