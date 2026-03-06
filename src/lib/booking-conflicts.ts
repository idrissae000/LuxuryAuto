import { getBusyWindowsFromGoogle, type BusyWindow } from "@/lib/google-calendar";

export type { BusyWindow };

export const getBusyWindowsCombined = async (_ownerId: string, timeMin: string, timeMax: string): Promise<BusyWindow[]> => {
  return getBusyWindowsFromGoogle(timeMin, timeMax).catch(() => []);
};
