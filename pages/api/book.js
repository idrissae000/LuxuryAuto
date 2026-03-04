import { google } from "googleapis";

function getAuth() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  let key = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;

  if (!email || !key) throw new Error("Missing GOOGLE_SERVICE_ACCOUNT_* env vars");

  key = key.replace(/\\n/g, "\n");

  return new google.auth.JWT({
    email,
    key,
    scopes: ["https://www.googleapis.com/auth/calendar"],
  });
}

function toISO(date, hhmm) {
  return new Date(`${date}T${hhmm}:00`).toISOString();
}

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") return res.status(405).json({ error: "POST only" });

    const {
      date,         // YYYY-MM-DD
      start,        // HH:MM
      duration,     // minutes
      service,
      name,
      phone,
      address,
      email,
      notes,
    } = req.body || {};

    if (!date || !start || !duration || !service || !name || !phone || !address) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    const calendarId = process.env.GOOGLE_CALENDAR_ID || "primary";
    const tz = process.env.BOOKING_TZ || "America/Chicago";

    const auth = getAuth();
    const calendar = google.calendar({ version: "v3", auth });

    const startISO = toISO(date, start);
    const endISO = new Date(new Date(startISO).getTime() + Number(duration) * 60000).toISOString();

    // Re-check freebusy to prevent double booking
    const timeMin = new Date(`${date}T00:00:00`).toISOString();
    const timeMax = new Date(`${date}T23:59:59`).toISOString();

    const fb = await calendar.freebusy.query({
      requestBody: { timeMin, timeMax, items: [{ id: calendarId }] },
    });

    const busy = fb.data.calendars?.[calendarId]?.busy || [];
    const overlaps = busy.some((b) => new Date(startISO) < new Date(b.end) && new Date(endISO) > new Date(b.start));

    if (overlaps) return res.status(409).json({ error: "That time was just booked. Pick another slot." });

    const event = await calendar.events.insert({
      calendarId,
      requestBody: {
        summary: `${service} — ${name}`,
        description:
          `Name: ${name}\n` +
          `Phone: ${phone}\n` +
          `Address: ${address}\n` +
          `Service: ${service}\n` +
          `Notes: ${notes || ""}`,
        start: { dateTime: startISO, timeZone: tz },
        end: { dateTime: endISO, timeZone: tz },
        attendees: email ? [{ email }] : undefined,
      },
    });

    return res.status(200).json({ ok: true, eventId: event.data.id });
  } catch (e) {
    return res.status(500).json({ error: e.message || "Server error" });
  }
}
