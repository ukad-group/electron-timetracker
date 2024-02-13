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
      }),
      {
        name: "beta-storage",
        storage: createJSONStorage(() => getStorage()),
      },
    ),
  ),
  Object.is,
);
