import { create } from "zustand";

type googleCalendarStoreProps = {
  googleEvents: any[];
  setGoogleEvents: (gEvents: any[]) => void;
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
