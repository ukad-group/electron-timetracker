import fs from "fs";
import path from "path";
import next from "next";
import { parse } from "url";
import { createServer } from "http";
import { app, dialog, ipcMain, Menu, Tray } from "electron";
import { autoUpdater, UpdateInfo } from "electron-updater";
import isDev from "electron-is-dev";
import { createWindow } from "./helpers/create-window";
import { parseReportsInfo, Activity } from "./helpers/parseReportsInfo";
import { getDateFromFilename, getPathFromDate } from "./helpers/datetime";
import { createDirByPath, searchReadFiles } from "./helpers/fs";

autoUpdater.autoDownload = false;
autoUpdater.autoInstallOnAppQuit = true;
ipcMain.on("beta-channel", (event, isBeta: boolean) => {
  autoUpdater.allowPrerelease = isBeta;
});

autoUpdater.allowDowngrade = true;
autoUpdater.on("error", (e: Error, message?: string) => {
  mainWindow?.webContents.send("errorMes", e, message);
});

autoUpdater.on("update-available", (info: UpdateInfo) => {
  autoUpdater.downloadUpdate();
  if (mainWindow) {
    mainWindow.webContents.send("update-available", true, info);
  }
});

autoUpdater.on("update-downloaded", (info: UpdateInfo) => {
  if (mainWindow) {
    mainWindow.webContents.send("downloaded", true, info);
  }
});

ipcMain.on("install", (event) => {
  autoUpdater.quitAndInstall(true);
});

const userDataDirectory = app.getPath("userData");

let mainWindow: Electron.CrossProcessExports.BrowserWindow | null = null;

const gotTheLock = app.requestSingleInstanceLock();

const generateWindow = () => {
  mainWindow = createWindow({
    width: 1000,
    height: 600,
    autoHideMenuBar: true,
  });

  mainWindow.loadURL("http://localhost:8000/");

  if (isDev) {
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.on("close", (event) => {
      event.preventDefault();
      mainWindow?.hide();
    });
  }
};

let tray: Tray | null = null;

const generateTray = () => {
  const contextMenu = Menu.buildFromTemplate([
    {
      label: "Activate",
      type: "normal",
      click: () => {
        if (isDev) {
          generateWindow();
        } else {
          mainWindow?.show();
        }
        autoUpdater.checkForUpdates();
      },
    },
    {
      label: "Quit",
      type: "normal",
      accelerator: "CmdOrCtrl+Q",
      click: () => {
        app.exit();
      },
    },
  ]);

  const trayIconPath = path.join(
    __dirname,
    "../renderer/out/images/clock-16.png"
  );

  tray = new Tray(trayIconPath);
  tray.setContextMenu(contextMenu);

  tray.on("click", () => {
    if (isDev) {
      generateWindow();
    } else {
      mainWindow?.show();
    }
    autoUpdater.checkForUpdates();
  });
};

app.on("before-quit", () => {
  tray?.destroy();
});

app.on("ready", async () => {
  const nextApp = next({
    dev: isDev,
    dir: app.getAppPath() + "/renderer",
  });

  const requestHandler = nextApp.getRequestHandler();

  await nextApp.prepare();

  createServer((req: any, res: any) => {
    const parsedUrl = parse(req.url, true);
    requestHandler(req, res, parsedUrl);
  }).listen(8000, () => {
    console.log("> Ready on http://localhost:8000");
  });

  if (!gotTheLock) {
    app.quit();
  } else {
    app.on("second-instance", (event, commandLine, workingDirectory) => {
      if (mainWindow) {
        if (mainWindow.isMinimized()) mainWindow.restore();
        mainWindow.show();
        mainWindow.focus();
      }
    });
    generateWindow();
  }

  generateTray();

  let currentSelectedDate = "";

  if (mainWindow) {
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
              readDataFromFile(timereportPath, (data: string | null) => {
                mainWindow && mainWindow.webContents.send("file-changed", data);
              });
            }
          });
        }
      }
    );

    ipcMain.on(
      "start-folder-watcher",
      (event, reportsFolder: string, calendarDate: Date) => {
        fs.watch(reportsFolder, { recursive: true }, (eventType, filename) => {
          if (eventType === "change" && filename) {
            const fileDate = getDateFromFilename(filename);

            if (fileDate === null) return;

            const monthsBetweenDates = Math.abs(
              fileDate.getMonth() - calendarDate.getMonth()
            );

            if (
              monthsBetweenDates > 1 ||
              fileDate.getFullYear() !== calendarDate.getFullYear()
            ) {
              return;
            }

            mainWindow?.webContents.send("any-file-changed");
          }
        });
      }
    );

    ipcMain.on("start-update-watcher", (event) => {
      mainWindow &&
        mainWindow.webContents.send("current-version", app.getVersion());

      app.whenReady().then(() => {
        autoUpdater.checkForUpdates();
      });
    });
  }
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
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

type Callback = (data: string | null) => void;
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

    const parsedProjects = parseReportsInfo(reportsFolder, date);

    const sortedProjAndAct: Record<string, string[]> = Object.keys(
      parsedProjects
    )
      .sort()
      .reduce((accumulator: Record<string, string[]>, key) => {
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
    ).reduce((accumulator: Record<string, string[]>, key) => {
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

ipcMain.handle(
  "app:find-month-projects",
  (event, reportsFolder: string, date: Date) => {
    if (!reportsFolder || !date) return [];

    const year = date.getFullYear().toString();
    const prevMonth = date.getMonth().toString().padStart(2, "0");
    const currentMonth = (date.getMonth() + 1).toString().padStart(2, "0");
    const nextMonth = (date.getMonth() + 2).toString().padStart(2, "0");
    const queries = [year + currentMonth, year + prevMonth, year + nextMonth];

    return searchReadFiles(reportsFolder, queries, year);
  }
);
