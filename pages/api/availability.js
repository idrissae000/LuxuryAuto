import { google } from "googleapis";

function getAuth() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  let key = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;

  if (!email || !key) throw new Error("Missing GOOGLE_SERVICE_ACCOUNT_* env vars");

  // Convert \n sequences into real newlines
  key = key.replace(/\\n/g, "\n");

  return new google.auth.JWT({
    email,
    key,
    scopes: ["https://www.googleapis.com/auth/calendar"],
  });
}

function hhmmToDate(date, hhmm) {
  // date: YYYY-MM-DD, hhmm: HH:MM
  return new Date(`${date}T${hhmm}:00`);
}

function addMinutes(dateObj, minutes) {
  const d = new Date(dateObj);
  d.setMinutes(d.getMinutes() + minutes);
  return d;
}

function overlaps(aStart, aEnd, bStartISO, bEndISO) {
  const bStart = new Date(bStartISO);
  const bEnd = new Date(bEndISO);
  return aStart < bEnd && aEnd > bStart;
}

export default async function handler(req, res) {
  try {
    const date = req.query.date; // YYYY-MM-DD
    const duration = parseInt(req.query.duration || "90", 10); // minutes
    const buffer = parseInt(req.query.buffer || "15", 10); // minutes

    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ error: "Use ?date=YYYY-MM-DD" });
    }

    const calendarId = process.env.GOOGLE_CALENDAR_ID || "primary";
    const auth = getAuth();
    const calendar = google.calendar({ version: "v3", auth });

    // Day window (server uses UTC; good enough for MVP. We'll refine if needed.)
    const timeMin = new Date(`${date}T00:00:00`).toISOString();
    const timeMax = new Date(`${date}T23:59:59`).toISOString();

    const fb = await calendar.freebusy.query({
      requestBody: {
        timeMin,
        timeMax,
        items: [{ id: calendarId }],
      },
    });

    const busy = fb.data.calendars?.[calendarId]?.busy || [];

    // Business hours (edit later)
    const START = "09:00";
    const END = "18:00";

    const slots = [];
    let cursor = hhmmToDate(date, START);
    const endBoundary = hhmmToDate(date, END);

    while (addMinutes(cursor, duration) <= endBoundary) {
      const slotStart = new Date(cursor);
      const slotEnd = addMinutes(cursor, duration);

      // apply buffer on both sides
      const paddedStart = addMinutes(slotStart, -buffer);
      const paddedEnd = addMinutes(slotEnd, buffer);

      const isBlocked = busy.some((b) => overlaps(paddedStart, paddedEnd, b.start, b.end));

      if (!isBlocked) {
        slots.push({
          start: `${String(slotStart.getHours()).padStart(2, "0")}:${String(slotStart.getMinutes()).padStart(2, "0")}`,
        });
      }

      cursor = addMinutes(cursor, 30); // slot step (every 30 min)
    }

    return res.status(200).json({ date, available: slots });
  } catch (e) {
    return res.status(500).json({ error: e.message || "Server error" });
  }
}
