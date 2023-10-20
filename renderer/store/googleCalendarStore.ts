import { create } from "zustand";

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
  isLogged: boolean;
  setIsLogged: (userLogged: boolean) => void;
  googleUsername: string;
  setGoogleUsername: (username: string) => void;
};

export const useGoogleCalendarStore = create<googleCalendarStoreProps>(
  (set) => {
    return {
      googleEvents: [],
      setGoogleEvents: (events) => set(() => ({ googleEvents: events })),
      isLogged: false,
      setIsLogged: (userLogged) => set(() => ({ isLogged: userLogged })),
      googleUsername: null,
      setGoogleUsername: (username) =>
        set(() => ({ googleUsername: username })),
    };
  }
);
