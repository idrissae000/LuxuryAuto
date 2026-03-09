import { google } from "googleapis";
import { BUSINESS_TIMEZONE } from "@/lib/constants";

export type BusyWindow = { start: string; end: string };

const calendarId = process.env.GOOGLE_CALENDAR_ID;

export const isGoogleCalendarConfigured = () =>
  Boolean(
    process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL &&
      (process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY || process.env.GOOGLE_PRIVATE_KEY) &&
      calendarId
  );

const getCalendarClient = () => {
  if (!isGoogleCalendarConfigured()) {
    return null;
  }

  const privateKey = (process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY ?? process.env.GOOGLE_PRIVATE_KEY)?.replace(/\\n/g, "\n");

  const auth = new google.auth.JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: privateKey,
    scopes: ["https://www.googleapis.com/auth/calendar"]
  });

  return google.calendar({ version: "v3", auth });
};

export const getBusyWindowsFromGoogle = async (timeMin: string, timeMax: string): Promise<BusyWindow[]> => {
  const calendar = getCalendarClient();
  if (!calendar || !calendarId) return [];

  const response = await calendar.freebusy.query({
    requestBody: {
      timeMin,
      timeMax,
      timeZone: BUSINESS_TIMEZONE,
      items: [{ id: calendarId }]
    }
  });

  const rawBusy = response.data.calendars?.[calendarId]?.busy ?? [];

  return rawBusy.filter((event): event is { start: string; end: string } => {
    return typeof event.start === "string" && typeof event.end === "string";
  });
};

export const createGoogleBookingEvent = async (payload: {
  start: string;
  end: string;
  service: string;
  customerName: string;
  phone: string;
  address: string;
  email?: string;
  notes?: string;
}) => {
  const calendar = getCalendarClient();
  if (!calendar || !calendarId) {
    throw new Error("Google Calendar is not configured. Add service account env vars and calendar ID.");
  }

  const attendees = payload.email ? [{ email: payload.email }] : undefined;

  const response = await calendar.events.insert({
    calendarId,
    requestBody: {
      summary: `${payload.service} — ${payload.customerName}`,
      description: [
        `Name: ${payload.customerName}`,
        `Phone: ${payload.phone}`,
        `Address: ${payload.address}`,
        `Service: ${payload.service}`,
        `Email: ${payload.email || "Not provided"}`,
        `Notes: ${payload.notes || "N/A"}`
      ].join("\n"),
      start: { dateTime: payload.start, timeZone: BUSINESS_TIMEZONE },
      end: { dateTime: payload.end, timeZone: BUSINESS_TIMEZONE },
      attendees
    }
  });

  return response.data.id ?? null;
};
