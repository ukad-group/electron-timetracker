import { createWithEqualityFn } from "zustand/traditional";
import { createJSONStorage, devtools, persist } from "zustand/middleware";
import { getStorage } from "./utils";
import { ScheduledEvents, ScheduledEventsStore } from "./types";

export const useScheduledEventsStore = createWithEqualityFn<ScheduledEventsStore>()(
  devtools(
    persist(
      (set) => ({
        event: { "": {} },
        setEvent: (event: ScheduledEvents) => set({ event: event }),
      }),
      {
        name: "scheduled-events-storage",
        storage: createJSONStorage(() => getStorage()),
      },
    ),
  ),
  Object.is,
);
