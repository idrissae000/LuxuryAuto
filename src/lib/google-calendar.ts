import { google } from "googleapis";
import { BUSINESS_TIMEZONE } from "@/lib/constants";

type BusyWindow = { start: string; end: string };

const calendarId = process.env.GOOGLE_CALENDAR_ID;

export const isGoogleCalendarConfigured = () =>
  Boolean(process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_PRIVATE_KEY && calendarId);

const getCalendarClient = () => {
  if (!isGoogleCalendarConfigured()) {
    return null;
  }

  const auth = new google.auth.JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
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

export const createCalendarEvent = async (payload: {
  start: string;
  end: string;
  serviceName: string;
  vehicleSize: string;
  customerName: string;
  phone: string;
  email: string;
  address: string;
  addons: string[];
  notes?: string;
  estimatedTotal: string;
}) => {
  const calendar = getCalendarClient();
  if (!calendar || !calendarId) {
    return null;
  }

  const response = await calendar.events.insert({
    calendarId,
    requestBody: {
      summary: `Luxury Auto Detailz — ${payload.serviceName} (${payload.vehicleSize})`,
      description: [
        `Customer: ${payload.customerName}`,
        `Phone: ${payload.phone}`,
        `Email: ${payload.email}`,
        `Address: ${payload.address}`,
        `Add-ons: ${payload.addons.length ? payload.addons.join(", ") : "None"}`,
        `Notes: ${payload.notes || "N/A"}`,
        `Estimated total: ${payload.estimatedTotal}`
      ].join("\n"),
      start: { dateTime: payload.start, timeZone: BUSINESS_TIMEZONE },
      end: { dateTime: payload.end, timeZone: BUSINESS_TIMEZONE }
    }
  });

  return response.data.id ?? null;
};
