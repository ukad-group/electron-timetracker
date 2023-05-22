import fs from "fs";
import path from "path";
import { app, dialog, ipcMain } from "electron";
import serve from "electron-serve";
import { createWindow } from "./helpers";
import ElectronStore from "electron-store";
import { getPathFromDate } from "./helpers/datetime";
import { createDirByPath } from "./helpers/fs";

const isProd: boolean = process.env.NODE_ENV === "production";

if (isProd) {
  serve({ directory: "app" });
} else {
  app.setPath("userData", `${app.getPath("userData")} (development)`);
}

const store = new ElectronStore();

(async () => {
  await app.whenReady();

  const mainWindow = createWindow("main", {
    width: 1000,
    height: 600,
    autoHideMenuBar: true,
  });

  if (isProd) {
    await mainWindow.loadURL("app://./home.html");
  } else {
    const port = process.argv[2];
    await mainWindow.loadURL(`http://localhost:${port}/`);
    mainWindow.webContents.openDevTools();
  }
})();

app.on("window-all-closed", () => {
  app.quit();
});

ipcMain.handle("app:get-files", () => {
  const appDir = "/home/mmmykhailo";
  const files = fs.readdirSync(appDir);

  return files.map((filename) => {
    const filePath = path.resolve(appDir, filename);
    const fileStats = fs.statSync(filePath);

    return {
      name: filename,
      path: filePath,
      size: Number(fileStats.size / 1000).toFixed(1), // kb
    };
  });
});

ipcMain.handle("app:set-dropbox-folder", (event, path: string) => {
  store.set("dropboxLocation", path);
});
ipcMain.handle("app:get-dropbox-folder", () => {
  return store.get("dropboxLocation");
});

ipcMain.handle("app:select-folder", async () => {
  const response = await dialog.showOpenDialog({
    properties: ["openDirectory"],
  });

  if (!response.canceled) {
    return response.filePaths[0];
  }
  return null;
});

ipcMain.handle("app:read-day-report", (event, date: Date) => {
  if (!date) return null;

  const dropbox = store.get("dropboxLocation") as string | null;
  if (!dropbox) return null;

  const timereportPath = getPathFromDate(date, dropbox);

  try {
    const data = fs.readFileSync(timereportPath, "utf8");
    return data;
  } catch (err) {
    return null;
  }
});

ipcMain.handle("app:write-day-report", (event, date: Date, report: string) => {
  if (!date) return null;

  const dropbox = store.get("dropboxLocation") as string | null;
  if (!dropbox) return null;

  const timereportPath = getPathFromDate(date, dropbox);

  try {
    createDirByPath(timereportPath.slice(0, timereportPath.lastIndexOf("/")));
    fs.writeFileSync(timereportPath, report);
    console.log("no errors");
  } catch (err) {
    console.log(err);
    return;
  }
});
