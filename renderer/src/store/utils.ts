import { IPC_MAIN_CHANNELS } from "@electron/helpers/constants";
import { StateStorage } from "zustand/middleware";

export const getStorage = (): StateStorage => ({
  getItem: async (name: string): Promise<string | null> => {
    return (await global.ipcRenderer.invoke(IPC_MAIN_CHANNELS.STORAGE_GET, name)) || null;
  },
  setItem: async (name: string, value: string): Promise<void> => {
    await global.ipcRenderer?.invoke(IPC_MAIN_CHANNELS.STORAGE_SET, name, value);
  },
  removeItem: async (name: string): Promise<void> => {
    await global.ipcRenderer.invoke(IPC_MAIN_CHANNELS.STORAGE_DELETE, name);
  },
});
