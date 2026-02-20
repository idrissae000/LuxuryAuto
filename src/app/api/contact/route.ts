import { NextResponse } from "next/server";
import { z } from "zod";
import { Resend } from "resend";

const schema = z.object({ name: z.string(), email: z.string().email(), message: z.string() });

export async function POST(request: Request) {
  try {
    const body = schema.parse(await request.json());

    if (process.env.RESEND_API_KEY && process.env.OWNER_NOTIFICATION_EMAIL) {
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: "Luxury Auto Detailz <contact@luxuryautodetailz.com>",
        to: process.env.OWNER_NOTIFICATION_EMAIL,
        subject: `Contact form from ${body.name}`,
        html: `<p>From: ${body.name} (${body.email})</p><p>${body.message}</p>`
      });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
