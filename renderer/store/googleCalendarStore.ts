import { create } from "zustand";

type googleCalendarStoreProps = {
  googleEvents: any[];
  setGoogleEvents: (gEvents: any[]) => void;
};

export const useGoogleCalendarStore = create<googleCalendarStoreProps>(
  (set) => {
    return {
      googleEvents: [],
      setGoogleEvents: (events) => set(() => ({ googleEvents: events })),
    };
  }
);
