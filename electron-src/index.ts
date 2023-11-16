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
import { initialize, trackEvent } from "@aptabase/electron/main";
import {
  callProfileInfoGraph,
  callTodayEventsGraph,
  getAuthUrl,
  getRefreshedAccessToken,
  getTokens,
} from "./helpers/API/office365Api";
import {
  getCardsOfMember,
  getMember,
  getTrelloAuthUrl,
} from "./helpers/API/trelloApi";
import {
  getAzureAuthUrl,
  getAzureAuthUrlAdditional,
  getAzureTokens,
  getTimetrackerCookie,
  getTimetrackerHolidays,
  getTimetrackerProjects,
  getTimetrackerVacations,
  getRefreshedUserInfoToken,
} from "./TimetrackerWebsiteApi";

initialize("A-EU-9361517871");
ipcMain.on(
  "send-analytics-data",
  (event, analyticsEvent: string, data?: Record<string, string>) => {
    trackEvent(analyticsEvent, data);
  }
);

const PORT = 51432;
let updateStatus: null | "available" | "downloaded" = null;
let updateVersion = "";

autoUpdater.autoDownload = false;
autoUpdater.autoInstallOnAppQuit = true;

ipcMain.on("beta-channel", (event, isBeta: boolean) => {
  autoUpdater.allowPrerelease = isBeta;
});

function setUpdateStatus(status: "available" | "downloaded", version: string) {
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

ipcMain.on("get-current-version", (event) => {
  mainWindow &&
    mainWindow.webContents.send("current-version", app.getVersion());
});

autoUpdater.on("update-available", (info: UpdateInfo) => {
  setUpdateStatus("available", info.version);
  autoUpdater.downloadUpdate();
  if (mainWindow) {
    mainWindow.webContents.send("update-available", true, info);
  }
});

autoUpdater.on("update-downloaded", (info: UpdateInfo) => {
  setUpdateStatus("downloaded", info.version);
  if (mainWindow) {
    mainWindow.webContents.send("downloaded", true, info);
  }
});

ipcMain.on("install", (event) => {
  autoUpdater.quitAndInstall(true, true);
});

ipcMain.on("front error", (event, errorTitle, errorMessage, data) => {
  mainWindow?.webContents.send("render or fetch error", errorTitle, errorMessage, data);
});

const userDataDirectory = app.getPath("userData");
let mainWindow: Electron.CrossProcessExports.BrowserWindow | null = null;
const gotTheLock = app.requestSingleInstanceLock();

const generateWindow = () => {
  mainWindow = createWindow({
    width: 1000,
    height: 600,
    autoHideMenuBar: true,
    icon: path.join(__dirname, "../renderer/out/images/logo.png"),
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

  const trayIconPath = path.join(__dirname, "../renderer/out/images/logo.png");

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
    mainWindow?.webContents.send("window-restored");
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
  }).listen(PORT, "127.0.0.1", () => {
    console.log(`> Ready on http://localhost:${PORT}`);
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
          if (fs.existsSync(timereportPath)) {
            mainWindow?.webContents.send("file exist", true);
            fs.watch(timereportPath, (eventType, filename) => {
              if (eventType === "change") {
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

    ipcMain.on("start-folder-watcher", (event, reportsFolder: string) => {
      try {
        if (fs.existsSync(reportsFolder)) {
          fs.watch(reportsFolder, { recursive: true }, (eventType) => {
            if (eventType === "change") {
              mainWindow?.webContents.send("any-file-changed");
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
    });
  }

  mainWindow?.on("restore", () => {
    mainWindow?.webContents.send("window-restored");
  });
});

app.on("window-all-closed", () => {
  // if (process.platform !== "darwin") {
  //   app.quit();
  // }

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

ipcMain.handle("app:update-status", async (event) => {
  return [updateStatus, updateVersion];
});

ipcMain.handle(
  "app:delete-file",
  async (event, reportsFolder: string, stringDate: string) => {
    const date = new Date(stringDate);
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
  (event, reportsFolder: string, stringDate: string) => {
    if (!reportsFolder || !stringDate.length) return null;

    const date = new Date(stringDate);
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
  (event, reportsFolder: string, stringDate: string, report: string) => {
    if (!reportsFolder || !stringDate.length) return null;

    const date = new Date(stringDate);
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
  (event, reportsFolder: string, stringDate: string) => {
    if (!reportsFolder || !stringDate.length) return [];

    const date = new Date(stringDate);

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
  (event, reportsFolder: string, stringDate: string) => {
    if (!reportsFolder || !stringDate.length) return [];

    const date = new Date(stringDate);
    const year = date.getFullYear().toString();
    const prevMonth = date.getMonth().toString().padStart(2, "0");
    const currentMonth = (date.getMonth() + 1).toString().padStart(2, "0");
    const nextMonth = (date.getMonth() + 2).toString().padStart(2, "0");
    const queries = [year + currentMonth, year + prevMonth, year + nextMonth];

    return searchReadFiles(reportsFolder, queries, year);
  }
);

// TRELLO FUNCTIONS

const getTrelloOptions = () => {
  return {
    key: process.env.NEXT_PUBLIC_TRELLO_KEY || "",
    returnUrl: process.env.NEXT_PUBLIC_TRELLO_REDIRECT_URI || "",
  };
};

ipcMain.on("trello:login", async () => {
  const options = getTrelloOptions();
  const trelloAuthUrl = getTrelloAuthUrl(options);

  mainWindow?.loadURL(trelloAuthUrl);
});

ipcMain.handle(
  "trello:get-profile-info",
  async (event, accessToken: string) => {
    const options = getTrelloOptions();

    return await getMember(accessToken, options);
  }
);

ipcMain.handle("trello:get-cards", async (event, accessToken: string) => {
  const options = getTrelloOptions();

  return await getCardsOfMember(accessToken, options);
});

// MICROSOFT OFFICE365 FUNCTIONS

const getOffice365Options = () => {
  return {
    clientId: process.env.NEXT_PUBLIC_OFFICE365_CLIENT_ID || "",
    clientSecret: process.env.NEXT_PUBLIC_OFFICE365_CLIENT_SECRET || "",
    redirectUri: process.env.NEXT_PUBLIC_OFFICE365_REDIRECT_URI || "",
    scope: process.env.NEXT_PUBLIC_OFFICE365_SCOPE || "",
  };
};

ipcMain.on("office365:login", async () => {
  const options = getOffice365Options();
  const office365AuthUrl = getAuthUrl(options);

  mainWindow?.loadURL(office365AuthUrl);
});

ipcMain.handle("office365:get-tokens", async (event, authCode: string) => {
  const options = getOffice365Options();

  return await getTokens(authCode, options);
});

ipcMain.handle(
  "office365:refresh-access-token",
  async (event, refreshToken: string) => {
    const options = getOffice365Options();

    return await getRefreshedAccessToken(refreshToken, options);
  }
);

ipcMain.handle(
  "office365:get-profile-info",
  async (event, accessToken: string) => {
    return await callProfileInfoGraph(accessToken);
  }
);

ipcMain.handle(
  "office365:get-today-events",
  async (event, accessToken: string) => {
    return await callTodayEventsGraph(accessToken);
  }
);

// TIMETRACKER WEBSITE

ipcMain.on("azure:login-base", async () => {
  const options = getOffice365Options();

  const optionsWithAllScope = {
    ...options,
    scope:
      "api://d7d02680-bd82-47ed-95f9-e977ab5f0487/access_as_user offline_access profile email offline_access openid User.Read Calendars.Read",
  };

  mainWindow?.loadURL(getAzureAuthUrl(optionsWithAllScope));
});

ipcMain.handle(
  "timetracker:get-user-info-token",
  async (event, authCode: string) => {
    const options = getOffice365Options();

    return await getAzureTokens(authCode, options);
  }
);

ipcMain.handle(
  "timetracker:refresh-user-info-token",
  async (event, refreshToken: string) => {
    const options = getOffice365Options();

    return await getRefreshedUserInfoToken(refreshToken, options);
  }
);

ipcMain.on("azure:login-additional", async () => {
  const options = getOffice365Options();

  const optionsWithPlannerScope = {
    ...options,
    scope:
      "api://d7d02680-bd82-47ed-95f9-e977ab5f0487/access_as_user offline_access",
  };

  mainWindow?.loadURL(getAzureAuthUrlAdditional(optionsWithPlannerScope));
});

ipcMain.handle(
  "timetracker:get-planner-token",
  async (event, authCode: string) => {
    const options = getOffice365Options();

    const optionsWithPlannerScope = {
      ...options,
      scope:
        "api://d7d02680-bd82-47ed-95f9-e977ab5f0487/access_as_user offline_access",
    };
    return await getAzureTokens(authCode, optionsWithPlannerScope);
  }
);

ipcMain.handle("timetracker:get-holidays", async (event, token: string) => {
  return await getTimetrackerHolidays(token);
});

ipcMain.handle(
  "timetracker:get-vacations",
  async (event, token: string, email: string) => {
    return await getTimetrackerVacations(token, email);
  }
);

ipcMain.handle("timetracker:login", async (event, idToken: string) => {
  return await getTimetrackerCookie(idToken);
});

ipcMain.handle("timetracker:get-projects", async (event, cookie: string) => {
  return await getTimetrackerProjects(cookie);
});
