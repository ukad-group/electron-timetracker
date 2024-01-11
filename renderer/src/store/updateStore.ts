import { createWithEqualityFn } from "zustand/traditional";
import {
  createJSONStorage,
  devtools,
  persist,
} from "zustand/middleware";
import { getStorage } from "./utils";
import { Update, UpdateStore } from "./types";

export const useUpdateStore = createWithEqualityFn<UpdateStore>()(
  devtools(
    persist(
      (set) => ({
        update: { age: "old", description: null },
        setUpdate: (update: Update) =>
          set({ update: { age: update.age, description: update.description } }),
      }),
      {
        name: "update-storage",
        storage: createJSONStorage(() => getStorage()),
      }
    )
  ),
  Object.is
);
