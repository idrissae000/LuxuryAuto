import { google } from "googleapis";
import { BUSINESS_TIMEZONE } from "@/lib/constants";

export type BusyWindow = { start: string; end: string };

const calendarId = process.env.GOOGLE_CALENDAR_ID;

const googleErrorStatus = (error: unknown) => {
  if (!error || typeof error !== "object") return undefined;
  const response = (error as { response?: { status?: number } }).response;
  return response?.status;
};

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

  let response;
  try {
    response = await calendar.events.insert({
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
  } catch (error) {
    const status = googleErrorStatus(error);
    if (status === 404) {
      throw new Error(
        "Google Calendar could not create the event (404). Ensure GOOGLE_CALENDAR_ID exists and the service account has 'Make changes to events' access."
      );
    }
    if (status === 403) {
      throw new Error(
        "Google Calendar denied event creation (403). Share the target calendar with the service account and grant edit access."
      );
    }
    throw error;
  }

  return response.data.id ?? null;
};
