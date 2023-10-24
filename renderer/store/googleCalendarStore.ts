import { createWithEqualityFn } from "zustand/traditional";

export type GoogleEvent = {
  created: string;
  creator: { email: string; self: boolean };
  description: string;
  end: { dateTime: string; timeZone: string };
  etag: string;
  eventType: string;
  htmlLink: URL;
  iCalUID: string;
  id: string;
  kind: string;
  organizer: { email: string; self: true };
  reminders: { useDefault: boolean };
  sequence: number;
  start: { dateTime: string; timeZone: string };
  status: string;
  summary: string;
  updated: string;
  from: { date: string; time: string };
  to: { date: string; time: string };
  isAdded?: boolean;
  project?: string;
  activity?: string;
};

type googleCalendarStoreProps = {
  googleEvents: GoogleEvent[];
  setGoogleEvents: (gEvents: GoogleEvent[]) => void;
};

export const useGoogleCalendarStore =
  createWithEqualityFn<googleCalendarStoreProps>((set) => {
    return {
      googleEvents: [],
      setGoogleEvents: (events) => set(() => ({ googleEvents: events })),
    };
  }, null);
