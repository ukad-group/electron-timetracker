import { createWithEqualityFn } from "zustand/traditional";
import {
  StateStorage,
  createJSONStorage,
  devtools,
  persist,
} from "zustand/middleware";

export type ScheduledEvents = Record<
  string,
  { modalProject?: string; modalActivity?: string }
>;

export type ScheduledEventsStore = {
  event: ScheduledEvents;
  setEvent: (event: ScheduledEvents) => void;
};

const storage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    return (await global.ipcRenderer.invoke("storage:get", name)) || null;
  },
  setItem: async (name: string, value: string): Promise<void> => {
    await global.ipcRenderer.invoke("storage:set", name, value);
  },
  removeItem: async (name: string): Promise<void> => {
    await global.ipcRenderer.invoke("storage:delete", name);
  },
};

export const useScheduledEventsStore =
  createWithEqualityFn<ScheduledEventsStore>()(
    devtools(
      persist(
        (set) => ({
          event: { "": {} },
          setEvent: (event: ScheduledEvents) => set({ event: event }),
        }),
        {
          name: "scheduled-events-storage",
          storage: createJSONStorage(() => storage),
        }
      )
    ),
    () => false
  );
