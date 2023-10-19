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
import { getPathFromDate } from "./helpers/datetime";
import { createDirByPath, searchReadFiles } from "./helpers/fs";
import chokidar from 'chokidar';

const PORT = 51432;

let updateStatus: null | "available" | "downloaded" = null;
let updateVersion = "";
autoUpdater.autoDownload = false;
autoUpdater.autoInstallOnAppQuit = true;
ipcMain.on("beta-channel", (event: any, isBeta: boolean) => {
  autoUpdater.allowPrerelease = isBeta;
});
function updateUpdateStatus(
  status: "available" | "downloaded",
  version: string
) {
  updateStatus = status;
  updateVersion = version;
}
autoUpdater.allowDowngrade = true;
autoUpdater.on("error", (e: Error, message?: string) => {
  mainWindow?.webContents.send(
    "background error",
    "Updater error. An error was encountered during the download of the latest version. ",
    message
  );
});

ipcMain.on("get-current-version", () => {
  mainWindow &&
    mainWindow.webContents.send("current-version", app.getVersion());
});

autoUpdater.on("update-available", (info: UpdateInfo) => {
  updateUpdateStatus("available", info.version);
  autoUpdater.downloadUpdate();
  if (mainWindow) {
    mainWindow.webContents.send("update-available", true, info);
  }
});

autoUpdater.on("update-downloaded", (info: UpdateInfo) => {
  updateUpdateStatus("downloaded", info.version);
  if (mainWindow) {
    mainWindow.webContents.send("downloaded", true, info);
  }
});

ipcMain.on("install", () => {
  autoUpdater.quitAndInstall(true, true);
});

ipcMain.on("front error", (event, errorTitle:string, errorMessage:string, data) => {
  mainWindow?.webContents.send("render error", errorTitle, errorMessage, data);
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

  mainWindow.loadURL(`http://localhost:${PORT}/`);

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
  tray.setToolTip("Timetracker");
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
  }).listen(PORT, () => {
    console.log(`> Ready on http://localhost:${PORT}`);
  });

  if (!gotTheLock) {
    app.quit();
  } else {
    app.on("second-instance", () => {
      if (mainWindow) {
        if (mainWindow.isMinimized()) mainWindow.restore();
        mainWindow.show();
        mainWindow.focus();
      }
    });
    generateWindow();
  }

  let currentSelectedDate = "";

  if (mainWindow) {
    app.whenReady().then(() => {
      autoUpdater.checkForUpdates();
      try {
        generateTray();
      } catch (err) {
        console.log(err);
        mainWindow?.webContents.send(
          "background error",
          "Tray error. Encountered errors while integrating the application into the system tray.",
          err
        );
      }
    });

    ipcMain.on(
      "start-file-watcher",
      (event, reportsFolder: string, selectedDate: Date) => {
        const timereportPath = getPathFromDate(selectedDate, reportsFolder);
        try {
          currentSelectedDate = selectedDate.toDateString();
          if (fs.existsSync(timereportPath)) {
            mainWindow?.webContents.send("file exist", true);
            chokidar
            .watch(timereportPath)
            .on('change', (timereportPath) => {
              if (
                currentSelectedDate === selectedDate.toDateString()
              ) {
                readDataFromFile(timereportPath, (data: string | null) => {
                  mainWindow &&
                    mainWindow.webContents.send("file-changed", data);
                });
              }
            });
          }
        } catch (err) {
          console.log(err);
          mainWindow?.webContents.send(
            "background error",
            "Watcher error. Updates to files might not be accurately displayed within the application. ",
            err
          );
        }
      }
    );

    ipcMain.on(
      "start-folder-watcher",
      (event, reportsFolder: string, calendarDate: Date) => {
        try {
          if (fs.existsSync(reportsFolder)) {
            chokidar
            .watch(reportsFolder)
            .on('change', () =>{
                mainWindow?.webContents.send("any-file-changed"); 
            })
          }
        } catch (err) {
          console.log(err);
          mainWindow?.webContents.send(
            "background error",
            "Watcher error. Updates to files might not be accurately displayed within the application. ",
            err
          );
        }
      }
    );
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
    mainWindow?.webContents.send(
      "background error",
      "File reading error. The file content display may be inaccurate or absent. ",
      err
    );
    callback(null);
  }
};
const deleteFile = (filePath: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    fs.unlink(filePath, (error) => {
      if (error) {
        console.error("Error deleting file:", error);
        reject(error);
      } else {
        console.log("File deleted successfully:", filePath);
        resolve();
      }
    });
  });
};

ipcMain.handle("app:update-status", async () => {
  return [updateStatus, updateVersion];
});

ipcMain.handle(
  "app:delete-file",
  async (event, reportsFolder: string, date: Date) => {
    const timereportPath = getPathFromDate(date, reportsFolder);
    try {
      await deleteFile(timereportPath);
      return true;
    } catch (error) {
      return false;
    }
  }
);
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
      mainWindow?.webContents.send(
        "background error",
        "Error in writing to file. The file writing process may be incorrect. ",
        err
      );
      return;
    }
  }
);

ipcMain.handle(
  "app:find-latest-projects",
  (event, reportsFolder: string, date: Date) => {
    if (!reportsFolder || !date) return [];
    try {
      const parsedProjects = parseReportsInfo(reportsFolder, date);

      const sortedProjAndAct: Record<string, string[]> = Object.keys(
        parsedProjects
      )
        .sort()
        .reduce((accumulator: Record<string, string[]>, key) => {
          const activitySet = new Set<string>();
          parsedProjects[key].forEach((activity: Activity) => {
            if (activity.activity) {
              activitySet.add(activity.activity);
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
          if (activity.description) {
            descriptionsSet.add(activity.description);
          }
        });

        accumulator[key] = Array.from(descriptionsSet);
        return accumulator;
      }, {});

      return { sortedProjAndAct, descriptionsSet };
    } catch (err) {
      console.log(err);
      mainWindow?.webContents.send(
        "background error",
        "Error reading past reports. Autocomplete suggestions will not appear in the form display. ",
        err
      );
      const sortedProjAndAct: Record<string, string[]> = {
        internal: [],
        hr: [],
      };
      const descriptionsSet: Record<string, string[]> = {
        internal: [],
        hr: [],
      };
      return { sortedProjAndAct, descriptionsSet };
    }
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
