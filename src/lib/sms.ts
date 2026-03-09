import twilio from "twilio";
import { BUSINESS_TIMEZONE } from "@/lib/constants";

/**
 * Normalize a US phone number to E.164 format (+1XXXXXXXXXX).
 * Accepts 10-digit bare numbers, numbers with a leading 1, or
 * numbers already prefixed with +1.
 */
export function toE164(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  if (phone.startsWith("+")) return phone;
  return `+${digits}`;
}

/**
 * Send an SMS booking confirmation via Twilio.
 * Returns true on success; on failure logs the error and returns false
 * so the booking itself is never rejected.
 */
export async function sendBookingConfirmationSms(
  customerPhone: string,
  appointmentStart: Date
): Promise<boolean> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_PHONE_NUMBER;

  if (!accountSid || !authToken || !fromNumber) {
    console.warn("[SMS] Twilio env vars missing — skipping SMS confirmation.");
    return false;
  }

  const formatted = new Intl.DateTimeFormat("en-US", {
    timeZone: BUSINESS_TIMEZONE,
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(appointmentStart);

  const formattedTime = new Intl.DateTimeFormat("en-US", {
    timeZone: BUSINESS_TIMEZONE,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(appointmentStart);

  const body =
    `Thanks for booking with Luxury Auto Detailing. ` +
    `Your appointment is confirmed for ${formatted} at ${formattedTime}. ` +
    `Reply if you need to make changes.`;

  try {
    const client = twilio(accountSid, authToken);
    await client.messages.create({
      body,
      from: fromNumber,
      to: toE164(customerPhone),
    });
    return true;
  } catch (error) {
    console.error("[SMS] Failed to send confirmation:", error);
    return false;
  }
}
