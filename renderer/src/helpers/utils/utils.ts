import { ReportActivity } from "./reports";
import { TutorialProgress } from "@/store/types";
import { HintConitions } from "./types";
import { IPC_MAIN_CHANNELS } from "@electron/helpers/constants";
import { LOCAL_STORAGE_VARIABLES } from "@/helpers/contstants";

export const replaceHyphensWithSpaces = (inputString: string): string => inputString.replace(/ - /g, " ");

export const concatSortArrays = (firstArr: ReportActivity[], secondArr: ReportActivity[]) => {
  const combinedArray = firstArr.concat(secondArr);

  combinedArray.sort((a, b) => {
    const timeA = a.from.split(":").map(Number);
    const timeB = b.from.split(":").map(Number);

    if (timeA[0] !== timeB[0]) {
      return timeA[0] - timeB[0];
    }

    return timeA[1] - timeB[1];
  });

  return combinedArray;
};

export function parseEventTitle(event, latestProjAndAct: Record<string, [string]>) {
  const { summary } = event; // Google
  const { subject } = event; // Office365
  const eventTitle = summary || subject;
  const items = eventTitle ? eventTitle.split(" - ") : "";
  const words = eventTitle ? eventTitle.split(" ") : "";
  let allProjects: Array<string> = Object.keys(latestProjAndAct);
  const userInfo = JSON.parse(localStorage.getItem("timetracker-user"));

  if (userInfo && userInfo.yearProjects) {
    allProjects = Object.keys(latestProjAndAct).concat(userInfo.yearProjects);
  }

  switch (items.length) {
    case 0:
      event.description = "";
      break;

    case 1:
      for (let i = 0; words.length > i; i++) {
        const project = words[i].toLowerCase();

        if (allProjects.includes(project)) {
          event.project = project;
          for (let j = 0; words.length > j; j++) {
            const activities = latestProjAndAct[project];
            if (activities && activities.includes(words[j].toLowerCase())) {
              event.activity = activities[activities.indexOf(words[j].toLowerCase())];
            }
          }
          break;
        }
      }

      event.description = items[0];
      break;

    case 2:
      if (allProjects.includes(items[0])) {
        event.project = items[0];
        event.description = items[1];
      } else {
        event.activity = items[0];
        event.description = items[1];
      }
      break;

    case 3:
      const project = items[0].toLowerCase();
      const activity = items[1];
      const description = items[2];

      if (allProjects.includes(project)) {
        const activities = latestProjAndAct[project];

        if (activities && activities.includes(activity.toLowerCase())) {
          event.activity = activities[activities.indexOf(activity.toLowerCase())];
        } else event.activity = activity;
      } else event.activity = activity;

      event.project = project;
      event.description = description;
      break;

    default:
      if (items) {
        event.description = items.join(" - ");
      }
  }

  return event;
}

export const changeHintConditions = (
  progress: TutorialProgress,
  setProgress: (event: TutorialProgress) => void,
  hints: Array<HintConitions>,
) => {
  hints.forEach((hint) => {
    if (!progress[`${hint.groupName}Conditions`]) {
      progress[`${hint.groupName}Conditions`] = hint.newConditions;
    } else {
      hint.existingConditions.forEach((condition, i) => {
        if (condition !== "same") {
          progress[`${hint.groupName}Conditions`][i] = condition;
        }
      });
    }
  });

  setProgress(progress);
};

export function extractTokenFromString(inputString: string) {
  const parts = inputString.split("#");

  if (parts.length >= 2) {
    const afterHash = parts[1];
    const tokenPart = afterHash.split("=");

    if (tokenPart.length === 2 && tokenPart[0] === "token") {
      return tokenPart[1];
    }
  }

  return "";
}

export const trackConnections = (connectedName: string) => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  if (localStorage.getItem(connectedName + "Connection") !== `${year}-${month}-${day}`) {
    global.ipcRenderer.send(IPC_MAIN_CHANNELS.ANALYTICS_DATA, "connections", {
      connected: connectedName,
    });

    localStorage.setItem(connectedName + "Connection", `${year}-${month}-${day}`);
  }
};

export const closeWindowIfNeeded = () => {
  const urlParams = new URLSearchParams(window.location.search);

  if (window.location.hash || window.location.search) {
    if (
      window.location.search.includes("code") &&
      window.location.search.includes("state=office365code") &&
      !window.location.search.includes("error")
    ) {
      localStorage.setItem(LOCAL_STORAGE_VARIABLES.OFFICE_365_AUTH_CODE, urlParams.get("code"));
      global.ipcRenderer.send(IPC_MAIN_CHANNELS.CHILD_WINDOW_CLOSED, "office365");
    }

    if (
      window.location.search.includes("code") &&
      window.location.search.includes("state=jiracode") &&
      !window.location.search.includes("error")
    ) {
      localStorage.setItem(LOCAL_STORAGE_VARIABLES.JIRA_AUTH_CODE, urlParams.get("code"));
      global.ipcRenderer.send(IPC_MAIN_CHANNELS.CHILD_WINDOW_CLOSED, "jira");
    }

    if (
      window.location.search.includes("code") &&
      window.location.search.includes("state=googlecalendarcode") &&
      !window.location.search.includes("error")
    ) {
      localStorage.setItem(LOCAL_STORAGE_VARIABLES.GOOGLE_AUTH_CODE, urlParams.get("code"));
      global.ipcRenderer.send(IPC_MAIN_CHANNELS.CHILD_WINDOW_CLOSED, "google");
    }

    if (window.location.hash.includes("token") && !window.location.hash.includes("error")) {
      const tokenFromUrl = extractTokenFromString(window.location.hash);

      localStorage.setItem(LOCAL_STORAGE_VARIABLES.TRELLO_AUTH_TOKEN, tokenFromUrl);
      global.ipcRenderer.send(IPC_MAIN_CHANNELS.CHILD_WINDOW_CLOSED, "trello");
    }

    if (window.location.search.includes("code") && window.location.search.includes("state=azure-base")) {
      localStorage.setItem(LOCAL_STORAGE_VARIABLES.TIMETRACKER_WEBSITE_CODE, urlParams.get("code"));
      global.ipcRenderer.send(IPC_MAIN_CHANNELS.CHILD_WINDOW_CLOSED, "timetracker-website");
    }

    if (window.location.search.includes("code") && window.location.search.includes("state=azure-additional")) {
      return;
    }

    window.close();
  }
};
