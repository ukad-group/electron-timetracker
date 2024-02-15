import { Dispatch, SetStateAction } from "react";
import { ReportActivity } from "@/helpers/utils/reports";
import { IPC_MAIN_CHANNELS } from "@electron/helpers/constants";
import { stringToMinutes } from "@/helpers/utils/utils";

export const editActivity = (
  activity: ReportActivity,
  selectedDateActivities: Array<ReportActivity>,
  setSelectedDateActivities: Dispatch<SetStateAction<Array<ReportActivity>>>,
  setShouldAutosave: Dispatch<SetStateAction<boolean>>,
) => {
  const activityIndex = selectedDateActivities.findIndex((act) => act.id === activity.id);

  if (activityIndex >= 0) {
    setSelectedDateActivities((activities) => {
      try {
        const oldActivity = activities[activityIndex];
        const previousActivity = activities[activityIndex - 1] || false;
        const nextActivity = activities[activityIndex + 1] || false;

        if (
          Object.keys(activity).every((key) => {
            return oldActivity[key] === activity[key];
          })
        ) {
          return activities;
        }

        activities[activityIndex] = activity;

        if (previousActivity && previousActivity.isBreak) {
          previousActivity.to = activity.from;
        }

        if (nextActivity && nextActivity.isBreak) {
          nextActivity.from = activity.to;
        }

        return [...activities];
      } catch (err) {
        global.ipcRenderer.send(
          IPC_MAIN_CHANNELS.FRONTEND_ERROR,
          "Activity editing error",
          "An error occurred while editing reports. ",
          err,
        );
        return [...activities];
      }
    });
    setShouldAutosave(true);
    return true;
  } else {
    return false;
  }
};

export const addPastTime = (
  activity: ReportActivity,
  tempActivities: Array<ReportActivity>,
  selectedDateActivities: Array<ReportActivity>,
  setSelectedDateActivities: Dispatch<SetStateAction<Array<ReportActivity>>>,
) => {
  const newActFrom = stringToMinutes(activity.from);
  let isPastTime = false;

  for (let i = 0; i < selectedDateActivities.length; i++) {
    try {
      const indexActFrom = stringToMinutes(selectedDateActivities[i].from);
      const indexActTo = selectedDateActivities[i].to ? stringToMinutes(selectedDateActivities[i].to) : undefined;

      if (
        !isPastTime &&
        selectedDateActivities[i].isBreak &&
        i &&
        (newActFrom <= indexActFrom || (i !== selectedDateActivities.length - 1 && newActFrom < indexActTo))
      ) {
        tempActivities.push(activity);
        isPastTime = true;
      } else {
        if (!i && newActFrom < indexActFrom) {
          isPastTime = true;
          tempActivities.push(activity);
          tempActivities.push(...selectedDateActivities);
          break;
        }
        tempActivities.push(selectedDateActivities[i]);
      }
    } catch (err) {
      global.ipcRenderer.send(
        IPC_MAIN_CHANNELS.FRONTEND_ERROR,
        "Adding activity error",
        "An error occurred when adding a new activity to the report. ",
        err,
      );
      console.log(activity);
    }
  }
  if (isPastTime) {
    setSelectedDateActivities(tempActivities);
  }
  return isPastTime;
};
