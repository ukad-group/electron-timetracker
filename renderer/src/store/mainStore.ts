import { createWithEqualityFn } from "zustand/traditional";
import { createJSONStorage, devtools, persist } from "zustand/middleware";
import { getStorage } from "./utils";
import { MainStore } from "./types";

export const useMainStore = createWithEqualityFn<MainStore>()(
  devtools(
    persist(
      (set) => ({
        reportsFolder: null,
        setReportsFolder: (folder: string) => set({ reportsFolder: folder }),
      }),
      {
        name: "main-storage",
        storage: createJSONStorage(() => getStorage()),
      },
    ),
  ),
  Object.is,
);
