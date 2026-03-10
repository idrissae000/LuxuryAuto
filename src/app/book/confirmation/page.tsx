import { CheckCircle, Calendar, Clock, MapPin, User, Sparkles, Phone, Plus } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";

const formatPriceDollars = (cents: number) =>
  `$${(cents / 100).toFixed(cents % 100 === 0 ? 0 : 2)}`;

function parseAddons(raw?: string): { name: string; price_cents: number }[] {
  if (!raw) return [];
  return raw.split(",").map((entry) => {
    const [name, priceStr] = entry.split("|");
    return { name: name || "", price_cents: Number(priceStr) || 0 };
  }).filter((a) => a.name);
}

function formatTime(iso: string) {
  try {
    return format(new Date(iso), "h:mm a");
  } catch {
    return iso;
  }
}

function formatDate(dateStr: string) {
  try {
    // dateStr is YYYY-MM-DD; parse as local date
    const [y, m, d] = dateStr.split("-").map(Number);
    return format(new Date(y, m - 1, d), "EEEE, MMMM d, yyyy");
  } catch {
    return dateStr;
  }
}

export default async function BookingConfirmationPage({
  searchParams,
}: {
  searchParams: Promise<{
    id?: string;
    name?: string;
    service?: string;
    date?: string;
    time?: string;
    address?: string;
    addons?: string;
  }>;
}) {
  const params = await searchParams;
  const addons = parseAddons(params.addons);

  const hasDetails = params.name && params.service && params.date && params.time;

  return (
    <section className="section-shell flex max-w-2xl items-center justify-center">
      <div className="w-full space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/10">
            <CheckCircle className="h-8 w-8 text-emerald-400" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Appointment Confirmed</h1>
          <p className="mt-2 text-white/60">
            Your appointment with Luxury Auto Detailz is confirmed. Please save these details for your convenience.
          </p>
        </div>

        {/* Booking details card */}
        {hasDetails && (
          <div className="rounded-2xl border border-white/10 bg-brand-slate/70 p-6">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-white/50">
              <Sparkles className="h-4 w-4 text-brand-blue" />
              Booking Details
            </h2>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <User className="mt-0.5 h-5 w-5 shrink-0 text-brand-blue" />
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-white/40">Name</p>
                  <p className="text-lg">{params.name}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-brand-blue" />
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-white/40">Service</p>
                  <p className="text-lg">{params.service}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="mt-0.5 h-5 w-5 shrink-0 text-brand-blue" />
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-white/40">Date</p>
                  <p className="text-lg">{formatDate(params.date!)}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="mt-0.5 h-5 w-5 shrink-0 text-brand-blue" />
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-white/40">Time</p>
                  <p className="text-lg">{formatTime(params.time!)}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-brand-blue" />
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-white/40">Address</p>
                  <p className="text-lg">{params.address}</p>
                </div>
              </div>

              {addons.length > 0 && (
                <div className="flex items-start gap-3">
                  <Plus className="mt-0.5 h-5 w-5 shrink-0 text-brand-blue" />
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-white/40">Add-Ons</p>
                    {addons.map((a, i) => (
                      <p key={i} className="text-base text-white/80">
                        {a.name} — {formatPriceDollars(a.price_cents)}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {params.id && (
              <p className="mt-5 border-t border-white/10 pt-4 text-xs text-white/30">
                Reference: {params.id}
              </p>
            )}
          </div>
        )}

        {/* Fallback when no details are available */}
        {!hasDetails && (
          <div className="rounded-2xl border border-white/10 bg-brand-slate/70 p-6 text-center">
            <p className="text-white/70">
              Thank you for booking with Luxury Auto Detailz. We sent your confirmation details via email and SMS.
            </p>
            {params.id && (
              <p className="mt-3 text-sm text-brand-blue">Reference: {params.id}</p>
            )}
          </div>
        )}

        {/* Reschedule / cancel info */}
        <div className="rounded-2xl border border-white/10 bg-brand-slate/40 px-6 py-4">
          <div className="flex items-start gap-3">
            <Phone className="mt-0.5 h-5 w-5 shrink-0 text-white/40" />
            <p className="text-sm leading-relaxed text-white/60">
              Need to reschedule or cancel your appointment? Please call us at{" "}
              <a href="tel:+12817167524" className="font-medium text-brand-blue hover:underline">
                (281) 716-7524
              </a>
              .
            </p>
          </div>
        </div>

        {/* Back to home */}
        <div className="text-center">
          <Link
            href="/"
            className="btn-primary inline-block rounded-xl px-8 py-3 font-semibold"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </section>
  );
}
