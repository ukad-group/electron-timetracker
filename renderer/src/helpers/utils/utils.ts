import { ReportActivity } from "./reports";
import { GoogleEvent } from "../../store/googleCalendarStore";

export const replaceHyphensWithSpaces = (inputString: string): string => {
  const resultString = inputString.replace(/ - /g, " ");

  return resultString;
};

export const checkAlreadyAddedGoogleEvents = (
  originalEvents: GoogleEvent[],
  newEvents: GoogleEvent[]
) => {
  return newEvents.map((newEvent) => {
    const originalEvent = originalEvents.find(
      (item) => item?.id === newEvent?.id
    );

    if (originalEvent?.isAdded === true) {
      newEvent.isAdded = originalEvent.isAdded;
    } else {
      if (newEvent) {
        newEvent.isAdded = false;
      }
    }

    if (originalEvent?.project) newEvent.project = originalEvent.project;
    if (originalEvent?.activity) newEvent.activity = originalEvent.activity;

    return newEvent;
  });
};

export const concatSortArrays = (
  firstArr: ReportActivity[],
  secondArr: ReportActivity[]
) => {
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

// export const markActivityAsAdded = (
//   gEvents: GoogleEvent[],
//   editedActivity: ReportActivity | "new"
// ) => {
//   return gEvents.map((gEvent) => {
//     if (editedActivity === "new") {
//       return gEvent;
//     }

//     if (gEvent?.id === editedActivity?.calendarId) {
//       gEvent.isAdded = true;
//     }

//     return gEvent;
//   });
// };

export function parseEventTitle(
  event,
  latestProjAndAct: Record<string, [string]>
) {
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
              event.activity =
                activities[activities.indexOf(words[j].toLowerCase())];
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
          event.activity =
            activities[activities.indexOf(activity.toLowerCase())];
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
