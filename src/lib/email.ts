import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export const sendBookingEmails = async (payload: {
  ownerEmail: string;
  customerEmail: string;
  customerName: string;
  service: string;
  dateTime: string;
}) => {
  if (!resend || !process.env.OWNER_NOTIFICATION_EMAIL) {
    return;
  }

  await Promise.all([
    resend.emails.send({
      from: "Luxury Auto Detailz <bookings@luxuryautodetailz.com>",
      to: payload.ownerEmail,
      subject: `New booking: ${payload.service}`,
      html: `<p>New booking from ${payload.customerName} for ${payload.service} at ${payload.dateTime}.</p>`
    }),
    resend.emails.send({
      from: "Luxury Auto Detailz <bookings@luxuryautodetailz.com>",
      to: payload.customerEmail,
      subject: "Your Luxury Auto Detailz booking is confirmed",
      html: `<p>Hi ${payload.customerName}, your ${payload.service} appointment is confirmed for ${payload.dateTime}.</p>`
    })
  ]);
};
