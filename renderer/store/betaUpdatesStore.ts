import { ipcRenderer } from "electron";
import { create } from "zustand";
import {
  StateStorage,
  createJSONStorage,
  devtools,
  persist,
} from "zustand/middleware";

export type BetaStore = {
  isBeta: boolean;
  setIsBeta: (isDownload: boolean) => void;
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

export const useBetaStore = create<BetaStore>()(
  devtools(
    persist(
      (set) => ({
        isBeta: false,
        setIsBeta: (isDownload: boolean) => set({ isBeta: isDownload }),
      }),
      {
        name: "beta-storage",
        storage: createJSONStorage(() => storage),
      }
    )
  )
);
