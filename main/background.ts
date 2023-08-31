import fs from "fs";
import { app, dialog, ipcMain } from "electron";
import serve from "electron-serve";
import { autoUpdater } from "electron-updater";
import { createWindow } from "./helpers";
import { getPathFromDate } from "./helpers/datetime";
import { createDirByPath } from "./helpers/fs";
import { fileParser, Activity, AllActivities } from "./helpers/fileParser";

const isProd: boolean = process.env.NODE_ENV === "production";
type Callback = (data: string | null) => void;
if (isProd) {
  serve({ directory: "app" });
} else {
  app.setPath("userData", `${app.getPath("userData")} (development)`);
}

const userDataDirectory = app.getPath("userData");

(async () => {
  await app.whenReady();

  const mainWindow = createWindow({
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
  let currentSelectedDate = "";
  ipcMain.on(
    "start-file-watcher",
    (event, reportsFolder: string, selectedDate: Date) => {
      const timereportPath = getPathFromDate(selectedDate, reportsFolder);

      currentSelectedDate = selectedDate.toDateString();
      if (fs.existsSync(timereportPath)) {
        fs.watch(timereportPath, (eventType, filename) => {
          if (
            eventType === "change" &&
            currentSelectedDate === selectedDate.toDateString()
          ) {
            readDataFromFile(timereportPath, (data: string) => {
              mainWindow.webContents.send("file-changed", data);
            });
          }
        });
      }
    }
  );
})();

app.on("window-all-closed", () => {
  app.quit();
});

ipcMain.handle("storage:get", (event, storageName: string) => {
  return fs.readFileSync(`${userDataDirectory}/${storageName}`, "utf8");
});
ipcMain.handle("storage:set", (event, storageName: string, value: string) => {
  fs.writeFileSync(`${userDataDirectory}/${storageName}`, value);
});
ipcMain.handle("storage:delete", (event, storageName: string) => {
  fs.unlinkSync(`${userDataDirectory}/${storageName}`);
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
const readDataFromFile = (timereportPath: string, callback: Callback) => {
  if (!fs.existsSync(timereportPath)) return callback(null);
  try {
    const data = fs.readFileSync(timereportPath, "utf8");
    callback(data);
  } catch (err) {
    console.error(err);
    callback(null);
  }
};

ipcMain.handle(
  "app:read-day-report",
  (event, reportsFolder: string, date: Date) => {
    if (!reportsFolder || !date) return null;

    const timereportPath = getPathFromDate(date, reportsFolder);

    return new Promise((resolve) => {
      readDataFromFile(timereportPath, (data) => {
        resolve(data);
      });
    });
  }
);

ipcMain.handle(
  "app:write-day-report",
  (event, reportsFolder: string, date: Date, report: string) => {
    if (!reportsFolder || !date) return null;

    const timereportPath = getPathFromDate(date, reportsFolder);

    try {
      createDirByPath(timereportPath.slice(0, timereportPath.lastIndexOf("/")));
      fs.writeFileSync(timereportPath, report);
    } catch (err) {
      console.log(err);
      return;
    }
  }
);

ipcMain.handle(
  "app:find-latest-projects",
  (event, reportsFolder: string, date: Date) => {
    if (!reportsFolder || !date) return [];

    const parsedProjects = fileParser(reportsFolder, date);

    const sortedProjAndAct: Record<string, string[]> = Object.keys(
      parsedProjects
    )
      .sort()
      .reduce((accumulator, key) => {
        const activitySet = new Set<string>();

        parsedProjects[key]?.forEach((activity: Activity) => {
          if (activity.acti) {
            activitySet.add(activity.acti);
          }
        });

        accumulator[key] = Array.from(activitySet);
        return accumulator;
      }, {});

    const descriptionsSet: Record<string, string[]> = Object.keys(
      parsedProjects
    ).reduce((accumulator, key) => {
      const descriptionsSet = new Set<string>();

      parsedProjects[key]?.forEach((activity: Activity) => {
        if (activity.desc) {
          descriptionsSet.add(activity.desc);
        }
      });

      accumulator[key] = Array.from(descriptionsSet);
      return accumulator;
    }, {});

    return { sortedProjAndAct, descriptionsSet };
  }
);

autoUpdater.autoDownload = false;
autoUpdater.autoInstallOnAppQuit = true;

app.whenReady().then(() => {
  autoUpdater.checkForUpdates();
});

autoUpdater.on("update-available", (info) => {
  autoUpdater.downloadUpdate();
});
