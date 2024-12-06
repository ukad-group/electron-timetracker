import { createWithEqualityFn } from "zustand/traditional";
import { createJSONStorage, devtools, persist } from "zustand/middleware";
import { getStorage } from "./utils";
import { BetaStore } from "./types";

export const useBetaStore = createWithEqualityFn<BetaStore>()(
  devtools(
    persist(
      (set) => ({
        isBeta: false,
        setIsBeta: (isDownload: boolean) => set({ isBeta: isDownload }),
        hydrated: false,
        setHydrated: () => set({ hydrated: true }),
      }),
      {
        name: "beta-storage",
        storage: createJSONStorage(() => getStorage()),
        // Checking if the storage file has been loaded
        onRehydrateStorage: () => (state) => {
          state?.setHydrated?.();
        },
      },
    ),
  ),
  Object.is,
);
