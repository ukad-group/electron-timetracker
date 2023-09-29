import { BrowserWindow, BrowserWindowConstructorOptions } from "electron";
import { join } from "path";

export function createWindow(
  options: BrowserWindowConstructorOptions
): BrowserWindow {
  let state = {};
  let win;

  const browserOptions: BrowserWindowConstructorOptions = {
    ...state,
    ...options,
    webPreferences: {
      nodeIntegration: false, // in next example false
      contextIsolation: false,
      preload: join(__dirname, "preload.js"),
      ...options.webPreferences,
    },
    minWidth: 360,
    minHeight: 600,
  };
  win = new BrowserWindow(browserOptions);

  return win;
}
