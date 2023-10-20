import { create } from "zustand";
import {
  StateStorage,
  createJSONStorage,
  devtools,
  persist,
} from "zustand/middleware";

export type Events = Record<string, {project?:string , activity?:string}>;

export type EventsStore = {
  event: Events;
  setEvent: (event: Events) => void;
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

export const useEventsStore = create<EventsStore>()(
  devtools(
    persist(
      (set) => ({
        event: {"":{}} ,
        setEvent: (event: Events) =>
          set({ event: event }),
      }),
      {
        name: "event-storage",
        storage: createJSONStorage(() => storage),
      }
    )
  )
);
