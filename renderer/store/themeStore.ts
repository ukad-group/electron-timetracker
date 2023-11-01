import { createWithEqualityFn } from "zustand/traditional";
import {
  StateStorage,
  createJSONStorage,
  devtools,
  persist,
} from "zustand/middleware";

export type ThemeStore = {
  theme: "light"|"dark";
  setTheme: (theme: "light"|"dark") => void;
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

export const useThemeStore = createWithEqualityFn<ThemeStore>()(
  devtools(
    persist(
      (set) => ({
        theme: "light",
        setTheme: (theme: "light"|"dark") => set({ theme: theme }),
      }),
      {
        name: "theme-storage",
        storage: createJSONStorage(() => storage),
      }
    )
  ),
  () => false
);