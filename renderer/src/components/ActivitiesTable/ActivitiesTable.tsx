import { useMemo, useEffect, useState } from "react";
import { ReportActivity } from "@/helpers/utils/reports";
import { checkIsToday, getCeiledTime } from "@/helpers/utils/datetime-ui";
import { shallow } from "zustand/shallow";
import { useScheduledEventsStore } from "@/store/googleEventsStore";
import { concatSortArrays } from "@/helpers/utils/utils";
import { ActivitiesTableProps } from "./types";
import { IPC_MAIN_CHANNELS } from "@electron/helpers/constants";
import { ActivitiesTableContext } from "./context";
import { MainView, CompactView } from "./components";
import { getTotalDuration, formatEvents, getActualEvents } from "./utils";
import { KEY_CODES } from "@/helpers/contstants";

export default function ActivitiesTable({
  activities,
  onEditActivity,
  selectedDate,
  latestProjAndAct,
  events,
  isLoading,
  showAsMain,
  validatedActivities,
}: ActivitiesTableProps) {
  const [ctrlPressed, setCtrlPressed] = useState(false);
  const [firstKey, setFirstKey] = useState(null);
  const [secondKey, setSecondtKey] = useState(null);
  const [firstKeyPressTime, setFirstKeyPressTime] = useState(null);
  const [timerId, setTimerId] = useState(null);
  const [scheduledEvents] = useScheduledEventsStore(
    (state) => [state.event, state.setEvent],
    shallow
  );

  const totalDuration = useMemo(
    () =>
      getTotalDuration(
        validatedActivities.filter((activity) => !activity.isBreak)
      ),
    [validatedActivities]
  );

  const tableActivities = useMemo(() => {
    const badgedActivities = validatedActivities.map((activity) => {
      const userInfo = JSON.parse(localStorage.getItem("timetracker-user"));
      if (userInfo && !userInfo?.yearProjects?.includes(activity.project)) {
        return { ...activity, isNewProject: true };
      }
      return activity;
    });
    const actualEvents = getActualEvents(events, activities);
    const formattedEvents: ReportActivity[] = formatEvents(
      actualEvents,
      latestProjAndAct
    );

    for (let i = 0; i < formattedEvents.length; i++) {
      if (
        Object.keys(scheduledEvents).includes(formattedEvents[i].description)
      ) {
        formattedEvents[i].project = formattedEvents[i].project
          ? formattedEvents[i].project
          : scheduledEvents[formattedEvents[i].description].project;
        formattedEvents[i].activity = formattedEvents[i].activity
          ? formattedEvents[i].activity
          : scheduledEvents[formattedEvents[i].description].activity;
      }
    }
    return formattedEvents && formattedEvents.length > 0
      ? concatSortArrays(badgedActivities, formattedEvents)
      : badgedActivities;
  }, [validatedActivities, events]);

  const copyToClipboardHandle = (e) => {
    const cell = e.target;
    const originaValue = cell.textContent;
    const cellColumnName = cell.getAttribute("data-column");
    let modifiedValue: string | number;

    if (cellColumnName === "duration" || cellColumnName === "total") {
      if (originaValue.includes("h")) {
        modifiedValue = originaValue.slice(0, -1);
      } else if (originaValue.includes("m")) {
        const minutes = originaValue.slice(0, -1);
        modifiedValue = Math.floor((minutes / 60) * 100) / 100;
      }
    }

    navigator.clipboard
      .writeText(modifiedValue ? modifiedValue : originaValue)
      .then(() => {
        const range = document.createRange();
        range.selectNodeContents(cell);

        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);

        setTimeout(() => {
          selection.removeAllRanges();
        }, 100);
      })
      .catch((error) => {
        console.error("Clipboard write error:", error);
      });
  };

  const copyActivityHandler = (activity) => {
    global.ipcRenderer.send(
      IPC_MAIN_CHANNELS.ANALYTICS_DATA,
      "copy_registration"
    );
    onEditActivity({
      ...activity,
      id: null,
      from: activities[activities.length - 2].to,
      to: checkIsToday(selectedDate) ? getCeiledTime() : "",
      duration: null,
    });
  };

  const handleKeyDown = (event) => {
    if (
      (event.ctrlKey && event.key === KEY_CODES.ARROW_UP) ||
      (event.metaKey && event.key === KEY_CODES.ARROW_UP)
    ) {
      if (validatedActivities.length > 0) {
        const lastActivity =
          validatedActivities[validatedActivities.length - 1];
        onEditActivity(lastActivity);
      }
    }
    if (event.key === KEY_CODES.CONTROL || event.metaKey) {
      setCtrlPressed(true);
    }

    if (
      (event.ctrlKey || event.key === KEY_CODES.CONTROL || event.metaKey) &&
      /^[0-9]$/.test(event.key)
    ) {
      const number = parseInt(event.key, 10);

      if (!firstKey && number >= 1 && number <= tableActivities.length) {
        setFirstKey(event.key);
        const selectedActivity = tableActivities[Number(event.key) - 1];
        const timerId = setTimeout(() => {
          if (selectedActivity.calendarId) {
            onEditActivity({
              ...selectedActivity,
              id: null,
            });
          } else {
            onEditActivity(selectedActivity);
          }
        }, 500);
        setTimerId(timerId);
        setFirstKeyPressTime(Date.now());
      }

      if (Date.now() - firstKeyPressTime < 500) {
        clearTimeout(timerId);
        setSecondtKey(event.key);
        const selectedActivity =
          tableActivities[Number(firstKey + event.key) - 1];

        if (selectedActivity) {
          if (selectedActivity.calendarId) {
            onEditActivity({
              ...selectedActivity,
              id: null,
            });
          } else onEditActivity(selectedActivity);
        }
      }
    }
  };

  const handleKeyUp = (event) => {
    if (event.key === KEY_CODES.CONTROL || event.key === KEY_CODES.META) {
      setFirstKey(null);
      setSecondtKey(null);
      setCtrlPressed(false);
    }
  };

  const editActivityHandler = (activity) => {
    global.ipcRenderer.send(
      IPC_MAIN_CHANNELS.ANALYTICS_DATA,
      "edit_registration"
    );
    if (activity.calendarId) {
      onEditActivity({
        ...activity,
        id: null,
      });
      global.ipcRenderer.send(
        IPC_MAIN_CHANNELS.ANALYTICS_DATA,
        "registrations",
        {
          registration: "google-calendar-event_registration",
        }
      );
      global.ipcRenderer.send(
        IPC_MAIN_CHANNELS.ANALYTICS_DATA,
        "registrations",
        {
          registration: `all_calendar-events_registration`,
        }
      );
    } else {
      onEditActivity(activity);
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.addEventListener("keyup", handleKeyUp);
    };
  }, [firstKey, tableActivities]);

  const value = useMemo(
    () => ({
      totalDuration,
      tableActivities,
      selectedDate,
      isLoading,
      ctrlPressed,
      copyToClipboardHandle,
      onEditActivity,
      activities,
      firstKey,
      secondKey,
      editActivityHandler,
      copyActivityHandler,
    }),
    [
      totalDuration,
      tableActivities,
      selectedDate,
      isLoading,
      ctrlPressed,
      copyToClipboardHandle,
      onEditActivity,
      activities,
      firstKey,
      secondKey,
      editActivityHandler,
      copyActivityHandler,
    ]
  );

  return (
    <ActivitiesTableContext.Provider value={value}>
      {showAsMain ? <MainView /> : <CompactView />}
    </ActivitiesTableContext.Provider>
  );
}
