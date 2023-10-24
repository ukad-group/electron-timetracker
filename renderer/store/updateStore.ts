import { createWithEqualityFn } from "zustand/traditional";
import {
  StateStorage,
  createJSONStorage,
  devtools,
  persist,
} from "zustand/middleware";

type Update = { age: "old" | "new"; description: string | null };

export type UpdateStore = {
  update: Update | null;
  setUpdate: (update: Update) => void;
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
        storage: createJSONStorage(() => storage),
      }
    )
  ),
  null
);
