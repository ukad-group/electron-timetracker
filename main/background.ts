import fs from "fs";
import { app, dialog, ipcMain } from "electron";
import serve from "electron-serve";
import { autoUpdater } from "electron-updater";
import { createWindow } from "./helpers";
import { getPathFromDate } from "./helpers/datetime";
import { createDirByPath } from "./helpers/fs";

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
function calcDurationBetweenTimes(from: string, to: string): number {
  if (from == undefined || to == undefined) {
    return null;
  }
  const startParts = from.split(":");
  const endParts = to.split(":");

  const startHours = parseInt(startParts[0], 10) || 0;
  const startMinutes = parseInt(startParts[1], 10) || 0;

  const endHours = parseInt(endParts[0], 10) || 0;
  const endMinutes = parseInt(endParts[1], 10) || 0;

  const startTotalMinutes = startHours * 60 + startMinutes;
  const endTotalMinutes = endHours * 60 + endMinutes;

  const totalMinutes = endTotalMinutes - startTotalMinutes;

  const hours = Math.round((totalMinutes / 60) * 100) / 100;

  return hours;
}
ipcMain.handle(
  "app:find-latest-projects",
  (event, reportsFolder: string, date: Date) => {
    if (!reportsFolder || !date) return [];

    type Activity = {
      acti: string;
      desc: string;
      dur: number;
    };

    type AllActivities = {
      internal: Activity[];
      hr: Activity[];
    };

    const parsedProjects: AllActivities = {
      internal: [],
      hr: [],
    };

    let currentDate = new Date(date);

    for (let i = 0; i < 31; i++) {
      currentDate.setDate(currentDate.getDate() - 1);
      const timereportPath = getPathFromDate(currentDate, reportsFolder);
      const timeRegex = /^[0-9]+:[0-9]+/;
      try {
        const lines = fs.readFileSync(timereportPath, "utf8").split("\n");

        for (let j = 0; j < lines.length; j++) {
          if (!timeRegex.test(lines[j])) continue;
          const parts = lines[j].split(" - ");
          const from = parts[0]?.trim();
          const to = lines[j + 1]?.split(" - ")[0];
          const project = parts[1]?.trim();
          const activity = parts[2]?.trim();
          const description = parts[3]?.trim();

          if (!project || project?.startsWith("!")) continue;

          if (!parsedProjects.hasOwnProperty(project) && parts.length === 2) {
            parsedProjects[project] = [
              {
                acti: "",
                desc: "",
                dur: to ? calcDurationBetweenTimes(from, to) : 0,
              },
            ];
            continue;
          }

          if (!parsedProjects.hasOwnProperty(project) && parts.length === 3) {
            parsedProjects[project] = [
              {
                acti: "",
                desc: activity,
                dur: to ? calcDurationBetweenTimes(from, to) : 0,
              },
            ];
            continue;
          }
          if (!parsedProjects.hasOwnProperty(project) && parts.length === 4) {
            parsedProjects[project] = [
              {
                acti: activity,
                desc: description,
                dur: to ? calcDurationBetweenTimes(from, to) : 0,
              },
            ];
            continue;
          }
          const newctivity: Activity = {
            acti: "",
            desc: "",
            dur: to ? calcDurationBetweenTimes(from, to) : 0,
          };
          if (parts.length === 3) {
            newctivity.desc = activity;
          }

          if (parts.length === 4) {
            newctivity.acti = activity;
            newctivity.desc = description;
          }

          parsedProjects[project].push(newctivity);
        }
      } catch (e) {
        continue;
      }
    }

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
      const activitySet = new Set<string>();

      parsedProjects[key]?.forEach((activity: Activity) => {
        if (activity.desc) {
          activitySet.add(activity.desc);
        }
      });

      accumulator[key] = Array.from(activitySet);
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
