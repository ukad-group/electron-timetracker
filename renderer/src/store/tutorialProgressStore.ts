import { createWithEqualityFn } from "zustand/traditional";
import { createJSONStorage, devtools, persist } from "zustand/middleware";
import { getStorage } from "./utils";
import { TutorialProgress, TutorialProgressStore } from "./types";

export const useTutorialProgressStore =
  createWithEqualityFn<TutorialProgressStore>()(
    devtools(
      persist(
        (set) => ({
          progress: { skipAll: [false] },
          setProgress: (event: TutorialProgress) => set({ progress: event }),
        }),
        {
          name: "tutorial-progress-storage",
          storage: createJSONStorage(() => getStorage()),
        }
      )
    ),
    Object.is
  );
