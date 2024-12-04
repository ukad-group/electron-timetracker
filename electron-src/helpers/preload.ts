/* eslint-disable @typescript-eslint/no-namespace */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { ipcRenderer, IpcRenderer, app, App } from "electron";

declare global {
  namespace NodeJS {
    interface Global {
      ipcRenderer: IpcRenderer;
      app: App;
    }
  }
}

// Since we disabled nodeIntegration we can reintroduce
// needed node functionality here
process.once("loaded", () => {
  global.ipcRenderer = ipcRenderer;
  global.app = app;
});

export interface IElectronAPI {
  getCurrentPort: () => string | undefined,
  store: {
    getItem: (key: string) => any;
    setItem: (key: string, val: any) => void;
    removeItem: (key: string) => void;
    clear: () => void;
  };
}

declare global {
  interface Window {
    electronAPI: IElectronAPI
  }
}

window.electronAPI = {
  getCurrentPort: () => process.env.NEXT_PUBLIC_PORT,
  store: {
    getItem: (key: string) => {
      return ipcRenderer.sendSync('electron-store-get', key);
    },
    setItem: (key: string, val:any) => {
      ipcRenderer.send('electron-store-set', key, val);
    },
    removeItem: (key: string) => {
      return ipcRenderer.send('electron-store-remove', key);
    },
    clear: () => {
      return ipcRenderer.send('electron-store-clear');
    }
  }
}
