import { createWithEqualityFn } from "zustand/traditional";
import {
  createJSONStorage,
  devtools,
  persist,
} from "zustand/middleware";
import { getStorage } from "./utils";
import { Theme, ThemeStore } from "./types";

export const useThemeStore = createWithEqualityFn<ThemeStore>()(
  devtools(
    persist(
      (set) => ({
        theme: { custom: "light", os: true },
        setTheme: (theme: Theme) => set({ theme: theme }),
      }),
      {
        name: "theme-storage",
        storage: createJSONStorage(() => getStorage()),
      }
    )
  ),
  Object.is
);