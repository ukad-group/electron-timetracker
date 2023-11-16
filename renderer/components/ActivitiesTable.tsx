import clsx from "clsx";
import { useMemo, useEffect, useState } from "react";
import {
  ReportActivity,
  calcDurationBetweenTimes,
  formatDuration,
  validation,
} from "../utils/reports";
import {
  checkIsToday,
  getCeiledTime,
  getTimeFromEventObj,
  padStringToMinutes,
} from "../utils/datetime-ui";
import TimeBadge from "../components/ui/TimeBadge";
import {
  Square2StackIcon,
  PencilSquareIcon,
} from "@heroicons/react/24/outline";
import Tooltip from "./ui/Tooltip/Tooltip";
import { PlusIcon } from "@heroicons/react/24/solid";
import { concatSortArrays, parseEventTitle } from "../utils/utils";
import Loader from "./ui/Loader";

type ActivitiesTableProps = {
  activities: ReportActivity[];
  onEditActivity: (activity: ReportActivity) => void;
  onDeleteActivity: (id: number) => void;
  selectedDate: Date;
  availableProjects: string[];
  events: ReportActivity[];
  isLoading: boolean;
};

const MS_PER_HOUR = 60 * 60 * 1000;

export default function ActivitiesTable({
  activities,
  onEditActivity,
  selectedDate,
  availableProjects,
  events,
  isLoading,
}: ActivitiesTableProps) {
  const [ctrlPressed, setCtrlPressed] = useState(false);
  const nonBreakActivities = useMemo(() => {
    return validation(activities.filter((activity) => !activity.isBreak));
  }, [activities]);

  const totalDuration = useMemo(() => {
    return nonBreakActivities.reduce((value, activity) => {
      return value + (activity.duration ? activity.duration : 0);
    }, 0);
  }, [nonBreakActivities]);

  const formatEvents = (events) => {
    if (events.length === 0) return [];

    const formattedEvents = events.map((event) => {
      const { start, end } = event;

      const startDateTime =
        start.timeZone === "UTC" ? `${start.dateTime}Z` : start.dateTime;
      const endDateTime =
        start.timeZone === "UTC" ? `${end.dateTime}Z` : end.dateTime;

      const from = getTimeFromEventObj(startDateTime);
      const to = getTimeFromEventObj(endDateTime);

      event = parseEventTitle(event, availableProjects);

      return {
        from: from,
        to: to,
        duration: calcDurationBetweenTimes(from, to),
        project: event.project || "",
        activity: event.activity || "",
        description: event.description || "",
        isValid: true,
        calendarId: event.id,
      };
    });

    return formattedEvents;
  };

  const getActualEvents = (events) => {
    if (!events.length) return [];

    const storedAddedEventsIds =
      JSON.parse(localStorage.getItem("addedEventsIds")) || [];

    const actualEvents = events.filter((event) => {
      const { end } = event;
      const to = getTimeFromEventObj(end.dateTime);
      const isOverlapped = activities.some((activity) => {
        return padStringToMinutes(activity.to) >= padStringToMinutes(to);
      });

      const isAdded = storedAddedEventsIds.some((id) => id === event.id);

      if (
        !isAdded &&
        event?.start?.dateTime &&
        event?.end?.dateTime &&
        !isOverlapped
      ) {
        return event;
      }
    });

    return actualEvents;
  };

  const tableActivities = useMemo(() => {
    const actualEvents = getActualEvents(events);
    const formattedEvents = formatEvents(actualEvents);

    return formattedEvents && formattedEvents.length > 0
      ? concatSortArrays(nonBreakActivities, formattedEvents)
      : nonBreakActivities;
  }, [nonBreakActivities, events]);

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
        const hours = Math.floor((minutes / 60) * 100) / 100;
        modifiedValue = hours;
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

  const handleKeyDown = (event) => {
    if (
      (event.ctrlKey && event.key === "ArrowUp") ||
      (event.key === "Meta" && event.key === "ArrowUp")
    ) {
      if (nonBreakActivities.length > 0) {
        const lastActivity = nonBreakActivities[nonBreakActivities.length - 1];
        onEditActivity(lastActivity);
      }
    }
    if (event.key === "Control" || event.key === "Meta") {
      setCtrlPressed(true);
    }
    if (
      (event.ctrlKey || event.key === "Control" || event.key === "Meta") &&
      /^[1-9]$/.test(event.key)
    ) {
      const number = parseInt(event.key, 10);
      if (number >= 1 && number <= nonBreakActivities.length) {
        const selectedActivity = nonBreakActivities[Number(event.key) - 1];
        if (selectedActivity.calendarId) {
          onEditActivity({
            ...selectedActivity,
            id: null,
          });
        } else {
          onEditActivity(selectedActivity);
        }
      }
    }
  };

  const handleKeyUp = (event) => {
    if (event.key === "Control" || event.key === "Meta") {
      setCtrlPressed(false);
    }
  };

  const editActivityHandler = (activity) => {
    if (activity.calendarId) {
      onEditActivity({
        ...activity,
        id: null,
      });
      global.ipcRenderer.send("send-analytics-data", "registrations", {
        registration: "google-calendar-event_registration",
      });
      global.ipcRenderer.send("send-analytics-data", "registrations", {
        registration: `all_calendar-events_registration`,
      });
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
  }, [nonBreakActivities]);

  return (
    <table className="min-w-full divide-y divide-gray-300 table-fixed dark:divide-gray-600">
      <thead className="text-gray-900 dark:text-dark-heading">
        <tr>
          <th
            scope="col"
            className="w-24 pb-6 px-3 text-left text-sm font-semibold"
          >
            Interval
          </th>
          <th
            scope="col"
            className="w-24 pb-6 px-3 text-left text-sm font-semibold"
          >
            Duration
          </th>
          <th
            scope="col"
            className="w-32 pb-6 px-3 text-left text-sm font-semibold relative"
          >
            <span className="block absolute text-xs text-gray-500 top-[22px] dark:text-slate-400">
              activity
            </span>
            Project
          </th>
          <th scope="col" className="pb-6 px-3 text-left text-sm font-semibold">
            Description
          </th>
          {/* <th
            scope="col"
            className="relative w-8 pb-6 pl-3 pr-4 sm:pr-6 md:pr-0"
          >
            <span className="sr-only">Delete</span>
          </th> */}
          <th
            scope="col"
            className="relative w-8 pb-6 pl-3 pr-4 sm:pr-6 md:pr-0"
          >
            <span className="sr-only">Copy</span>
          </th>
          <th
            scope="col"
            className="relative w-8 pb-6 pl-3 pr-4 sm:pr-6 md:pr-0"
          >
            <span className="sr-only">Edit</span>
          </th>
        </tr>
      </thead>
      <tbody className="text-gray-500 dark:text-slate-400">
        {tableActivities.length > 0 &&
          tableActivities?.map((activity, i) => (
            <tr
              key={i}
              className={clsx(
                `border-b border-gray-200 dark:border-gray-300 `,
                {
                  "border-dashed border-b-2 border-gray-200 dark:border-gray-400":
                    tableActivities[i].to != tableActivities[i + 1]?.from &&
                    i + 1 !== tableActivities.length &&
                    !activity.calendarId,
                  "dark:border-b-2 dark:border-zinc-800": activity.calendarId,
                }
              )}
            >
              <td
                className={`relative py-4 pl-4 pr-3 text-sm  whitespace-nowrap sm:pl-6 md:pl-0 ${
                  activity.calendarId ? "opacity-50" : ""
                }`}
              >
                {ctrlPressed && (
                  <span className="absolute -left-4 text-blue-700">
                    {i + 1}
                  </span>
                )}
                <span
                  className={clsx({
                    "py-1 px-2 -mx-2 rounded-full font-medium bg-red-100 text-red-800 dark:text-red-400 dark:bg-red-400/20":
                      !activity.isValid,
                  })}
                >
                  {activity.from} - {activity.to}
                </span>
              </td>
              <td
                className={`px-3 py-4 text-sm font-medium text-gray-900 dark:text-dark-heading whitespace-nowrap ${
                  activity.calendarId ? "opacity-50" : ""
                }`}
              >
                <Tooltip>
                  <p data-column="duration" onClick={copyToClipboardHandle}>
                    {formatDuration(activity.duration)}
                  </p>
                </Tooltip>
              </td>
              <td
                className={`flex flex-col px-3 py-4 ${
                  activity.calendarId ? "opacity-50" : ""
                }`}
              >
                <Tooltip>
                  <p
                    className="text-sm font-medium text-gray-900 dark:text-dark-heading"
                    onClick={copyToClipboardHandle}
                  >
                    {activity.project}
                  </p>
                </Tooltip>
                {activity.activity && (
                  <Tooltip>
                    <p
                      className="block text-xs  font-semibold mt-1"
                      onClick={copyToClipboardHandle}
                    >
                      {activity.activity}
                    </p>
                  </Tooltip>
                )}
              </td>
              <td
                className={`px-3 py-4 text-sm ${
                  activity.calendarId ? "opacity-50" : ""
                }`}
              >
                <Tooltip>
                  <p
                    onClick={copyToClipboardHandle}
                    className={clsx({
                      "py-1 px-2 -mx-2 rounded-full font-medium bg-yellow-100 text-yellow-800":
                        activity.mistakes?.includes("startsWith!"),
                    })}
                  >
                    {activity.description}
                  </p>
                  {activity.mistakes?.includes("startsWith!") && (
                    <span className="block text-xs mt-1">
                      Perhaps you wanted to report a break
                    </span>
                  )}
                </Tooltip>
              </td>
              <td className="relative text-sm font-medium text-right whitespace-nowrap">
                <div className={`${activity.calendarId ? "invisible" : ""}`}>
                  <button
                    className="group py-4 px-3"
                    title="Copy"
                    onClick={() => {
                      onEditActivity({
                        ...activity,
                        id: null,
                        from: activities[activities.length - 2].to,
                        to: checkIsToday(selectedDate) ? getCeiledTime() : "",
                        duration: null,
                      });
                    }}
                  >
                    <Square2StackIcon className="w-[18px] h-[18px] text-gray-600 group-hover:text-gray-900 group-hover:dark:text-dark-heading" />
                  </button>
                </div>
              </td>
              <td className="relative text-sm font-medium text-right whitespace-nowrap">
                <button
                  className="group py-4 px-3"
                  title={activity.calendarId ? "Add" : "Edit"}
                  onClick={() => editActivityHandler(activity)}
                >
                  {!activity.calendarId && (
                    <PencilSquareIcon className="w-[18px] h-[18px] text-gray-600 group-hover:text-gray-900 group-hover:dark:text-dark-heading" />
                  )}

                  {activity.calendarId && (
                    <PlusIcon className="w-[18px] h-[18px] text-gray-600 group-hover:text-gray-900 group-hover:dark:text-dark-heading" />
                  )}
                </button>
              </td>
            </tr>
          ))}
        <tr>
          <td className="py-4 px-3 text-sm whitespace-nowrap">
            <p>Total</p>
          </td>
          <td
            className="px-3 py-4 text-sm font-medium text-gray-900 dark:text-dark-heading whitespace-nowrap"
            onClick={copyToClipboardHandle}
          >
            <Tooltip>
              <p data-column="total">{formatDuration(totalDuration)}</p>
            </Tooltip>
          </td>
          <td className="px-3 py-4 text-sm font-medium text-gray-900 dark:text-dark-heading whitespace-nowrap">
            {tableActivities.length > 0 && (
              <TimeBadge
                hours={totalDuration / MS_PER_HOUR}
                startTime={tableActivities[0].from}
                selectedDate={selectedDate}
              />
            )}
          </td>
          <td colSpan={3}>{isLoading && <Loader />}</td>
        </tr>
      </tbody>
    </table>
  );
}

{
  /* <td className="relative text-sm font-medium text-right whitespace-nowrap">
              <button
                className="group py-4 px-3"
                title="Delete"
                onClick={() => {
                  onDeleteActivity(activity.id);
                }}
              >
                <ArchiveBoxXMarkIcon className="w-[18px] h-[18px] text-gray-600 group-hover:text-gray-900 dark:text-dark-heading" />
              </button>
            </td> */
}
