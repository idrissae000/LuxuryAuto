import { addMinutes, subMinutes } from "date-fns";
import { TRAVEL_BUFFER_MINUTES } from "@/lib/constants";
import { getBusyWindowsFromGoogle } from "@/lib/google-calendar";
import { supabaseAdmin } from "@/lib/supabase-admin";

type BusyWindow = { start: string; end: string };

export const getBusyWindowsFromDatabase = async (ownerId: string, timeMin: string, timeMax: string): Promise<BusyWindow[]> => {
  const from = subMinutes(new Date(timeMin), TRAVEL_BUFFER_MINUTES).toISOString();
  const to = addMinutes(new Date(timeMax), TRAVEL_BUFFER_MINUTES).toISOString();

  const { data, error } = await supabaseAdmin
    .from("bookings")
    .select("scheduled_start,scheduled_end,status")
    .eq("owner_id", ownerId)
    .neq("status", "canceled")
    .lt("scheduled_start", to)
    .gt("scheduled_end", from);

  if (error) throw error;

  return (data ?? []).map((booking) => ({
    start: booking.scheduled_start,
    end: addMinutes(new Date(booking.scheduled_end), TRAVEL_BUFFER_MINUTES).toISOString()
  }));
};

export const getBusyWindowsCombined = async (ownerId: string, timeMin: string, timeMax: string) => {
  const [dbBusy, googleBusy] = await Promise.all([
    getBusyWindowsFromDatabase(ownerId, timeMin, timeMax),
    getBusyWindowsFromGoogle(timeMin, timeMax).catch(() => [])
  ]);

  return [...dbBusy, ...googleBusy];
};
