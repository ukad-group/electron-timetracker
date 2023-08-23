import { ipcRenderer } from "electron";
import { create } from "zustand";
import {
  StateStorage,
  createJSONStorage,
  devtools,
  persist,
} from "zustand/middleware";

export type UpdateStore = {
  update: "old" | "new";
  setUpdate: (theme: "old" | "new") => void;
};

const storage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    return (await ipcRenderer.invoke("storage:get", name)) || null;
  },
  setItem: async (name: string, value: string): Promise<void> => {
    await ipcRenderer.invoke("storage:set", name, value);
  },
  removeItem: async (name: string): Promise<void> => {
    await ipcRenderer.invoke("storage:delete", name);
  },
};

export const useUpdateStore = create<UpdateStore>()(
  devtools(
    persist(
      (set) => ({
        update: "new",
        setUpdate: (update: "old" | "new") => set({ update: update }),
      }),
      {
        name: "update-storage",
        storage: createJSONStorage(() => storage),
      }
    )
  )
);
