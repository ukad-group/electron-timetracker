import clsx from "clsx";
import { useMemo, useEffect, useState, Fragment } from "react";
import {
  ReportActivity,
  calcDurationBetweenTimes,
  formatDuration,
} from "@/helpers/utils/reports";
import {
  checkIsToday,
  getCeiledTime,
  getTimeFromEventObj,
  padStringToMinutes,
} from "@/helpers/utils/datetime-ui";
import { TimeBadge } from "@/shared/TimeBadge";
import {
  Square2StackIcon,
  PencilSquareIcon,
} from "@heroicons/react/24/outline";
import { shallow } from "zustand/shallow";
import { useScheduledEventsStore } from "@/store/googleEventsStore";
import Tooltip from "@/shared/Tooltip/Tooltip";
import { PlusIcon } from "@heroicons/react/24/solid";
import { concatSortArrays, parseEventTitle } from "@/helpers/utils/utils";
import { Loader } from "@/shared/Loader";
import { ActivitiesTableProps } from "./types";
import { IPC_MAIN_CHANNELS } from "../../../../electron-src/helpers/constants";

const MS_PER_HOUR = 60 * 60 * 1000;

export default function ActivitiesTable({
  activities,
  onEditActivity,
  selectedDate,
  latestProjAndAct,
  events,
  isLoading,
  showAsMain,
  nonBreakActivities,
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

  const totalDuration = useMemo(() => {
    return nonBreakActivities.reduce((value, activity) => {
      return value + (activity.duration ? activity.duration : 0);
    }, 0);
  }, [nonBreakActivities]);

  const formatEvents = (events) => {
    if (!events.length) return [];

    return events.map((event) => {
      const { start, end } = event;

      const startDateTime =
        start?.timeZone === "UTC" ? `${start?.dateTime}Z` : start?.dateTime;
      const endDateTime =
        end?.timeZone === "UTC" ? `${end?.dateTime}Z` : end?.dateTime;

      const from = getTimeFromEventObj(startDateTime);
      const to = getTimeFromEventObj(endDateTime);

      event = parseEventTitle(event, latestProjAndAct);

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
  };

  const getActualEvents = (events) => {
    if (!events.length) return [];

    return events.filter((event) => {
      const { end } = event;
      const endDateTime =
        end?.timeZone === "UTC" ? `${end?.dateTime}Z` : end?.dateTime;
      const to = getTimeFromEventObj(endDateTime);
      const isOverlapped = activities.some((activity) => {
        return padStringToMinutes(activity.to) >= padStringToMinutes(to);
      });

      if (event?.start?.dateTime && event?.end?.dateTime && !isOverlapped) {
        return event;
      }
    });
  };

  const tableActivities = useMemo(() => {
    const badgedActivities = nonBreakActivities.map((activity) => {
      const userInfo = JSON.parse(localStorage.getItem("timetracker-user"));
      if (userInfo && !userInfo?.yearProjects?.includes(activity.project)) {
        return { ...activity, isNewProject: true };
      }
      return activity;
    });
    const actualEvents = getActualEvents(events);
    const formattedEvents: ReportActivity[] = formatEvents(actualEvents);

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
    if (event.key === "Control" || event.key === "Meta") {
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

  const renderMainViewTable = () =>
    tableActivities.length > 0 &&
    tableActivities?.map((activity, i) => (
      <tr
        key={i}
        className={clsx(
          `border-b border-gray-200 dark:border-gray-300 transition-transform `,
          {
            "border-dashed border-b-2 border-gray-200 dark:border-gray-400":
              tableActivities[i].to != tableActivities[i + 1]?.from &&
              i + 1 !== tableActivities.length &&
              !activity.calendarId,
            "dark:border-b-2 dark:border-zinc-800": activity.calendarId,
            "scale-105 ":
              (Number(firstKey) === i + 1 && !secondKey) ||
              (Number(firstKey + secondKey) === i + 1 && secondKey),
          }
        )}
      >
        <td
          className={`relative py-4 pl-4 pr-3 text-sm  whitespace-nowrap sm:pl-6 md:pl-0 ${
            activity.calendarId ? "opacity-50" : ""
          }`}
        >
          {ctrlPressed && (
            <span className="absolute -left-4 text-blue-700">{i + 1}</span>
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
          className={`relative px-3 py-4 ${
            activity.calendarId ? "opacity-50" : ""
          }`}
        >
          <div className="flex items-center gap-1">
            <Tooltip>
              <p
                className="text-sm font-medium text-gray-900 dark:text-dark-heading"
                onClick={copyToClipboardHandle}
              >
                {activity.project}
              </p>
            </Tooltip>
            {activity.isNewProject && (
              <p className="flex items-center h-fit w-fit text-xs px-1.5 py-0.5 rounded-full bg-green-100 text-green-800 dark:text-green-400 dark:bg-green-400/20 ">
                new
              </p>
            )}
          </div>
          {activity.activity && (
            <Tooltip>
              <p
                className="block text-xs font-semibold mt-1 old-break-word "
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
          {activity.description && (
            <Tooltip>
              <p onClick={copyToClipboardHandle} className="old-break-word">
                {activity.description}
              </p>
            </Tooltip>
          )}
          {activity.mistakes && (
            <p
              onClick={copyToClipboardHandle}
              className="w-fit old-break-word py-1 px-2 -mx-2 rounded-2xl font-medium bg-yellow-100 text-yellow-800 dark:text-yellow-400 dark:bg-yellow-400/20"
            >
              {activity.mistakes}
            </p>
          )}
        </td>
        <td className="relative text-sm font-medium text-right whitespace-nowrap">
          <div className={`${activity.calendarId ? "invisible" : ""}`}>
            <button
              className="group py-4 px-3"
              title="Copy"
              onClick={() => {
                copyActivityHandler(activity);
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
            onClick={() => {
              editActivityHandler(activity);
            }}
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
    ));

  const mainView = (
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
        {renderMainViewTable()}
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

  const renderCompactViewTable = () =>
    tableActivities.length > 0 &&
    tableActivities?.map((activity, i) => (
      <Fragment key={i}>
        <tr>
          <td
            className={`w-24 relative pt-4 pl-1 pr-1 text-sm whitespace-nowrap sm:pl-6 md:pl-0 ${
              activity.calendarId ? "opacity-50" : ""
            }`}
          >
            {ctrlPressed && (
              <span className="absolute -left-4 text-blue-700">{i + 1}</span>
            )}
            <span
              className={clsx("flex gap-1", {
                "py-1 px-1 rounded-full font-medium bg-red-100 text-red-800 dark:text-red-400 dark:bg-red-400/20":
                  !activity.isValid,
              })}
            >
              {activity.from} - {activity.to}
            </span>
          </td>

          <td
            className={`relative px-1 pt-4 ${
              activity.calendarId ? "opacity-50" : ""
            }`}
          >
            <div className="flex flex-wrap gap-x-2 items-center">
              <div className="flex gap-1">
                {activity.isNewProject && (
                  <p className="flex items-center shrink-0 w-fit h-fit text-xs px-1.5 py-0.5 rounded-full bg-green-100 text-green-800 dark:text-green-400 dark:bg-green-400/20 ">
                    new
                  </p>
                )}
                <Tooltip>
                  <p
                    className="text-sm font-medium text-gray-900 dark:text-dark-heading old-break-word"
                    onClick={copyToClipboardHandle}
                  >
                    {activity.project}
                  </p>
                </Tooltip>
              </div>

              {activity.activity && (
                <Tooltip>
                  <p
                    className="block text-xs font-semibold old-break-word text-gray-500 dark:text-slate-400"
                    onClick={copyToClipboardHandle}
                  >
                    {activity.activity}
                  </p>
                </Tooltip>
              )}
            </div>
          </td>

          <td className="relative text-sm font-medium text-right whitespace-nowrap">
            <div className={`${activity.calendarId ? "invisible" : ""}`}>
              <button
                className="group pt-4 px-1"
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
        </tr>
        <tr
          className={clsx(
            `border-b border-gray-200 dark:border-gray-300 transition-transform `,
            {
              "border-dashed border-b-2 border-gray-200 dark:border-gray-400":
                tableActivities[i].to != tableActivities[i + 1]?.from &&
                i + 1 !== tableActivities.length &&
                !activity.calendarId,
              "dark:border-b-2 dark:border-zinc-800": activity.calendarId,
              "scale-105 ":
                (Number(firstKey) === i + 1 && !secondKey) ||
                (Number(firstKey + secondKey) === i + 1 && secondKey),
            }
          )}
        >
          <td
            colSpan={2}
            className={`relative pb-4 pl-1 pr-1 text-sm sm:pl-6 md:pl-0 ${
              activity.calendarId ? "opacity-50" : ""
            }`}
          >
            <div className="flex flex-nowrap gap-1 items-center">
              <Tooltip>
                <p
                  data-column="duration"
                  onClick={copyToClipboardHandle}
                  className={`w-12 text-sm font-medium text-gray-900 dark:text-dark-heading whitespace-nowrap ${
                    activity.calendarId ? "opacity-50" : ""
                  }`}
                >
                  {`${formatDuration(activity.duration)}`}
                </p>
              </Tooltip>
              <Tooltip>
                <p
                  onClick={copyToClipboardHandle}
                  className={clsx("old-break-word", {
                    "py-1 px-2 -mx-2 rounded-full font-medium bg-yellow-100 text-yellow-800 dark:text-yellow-400 dark:bg-yellow-400/20":
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
            </div>
          </td>

          <td className="relative text-sm font-medium text-right whitespace-nowrap">
            <button
              className="group pb-4 px-1"
              title={activity.calendarId ? "Add" : "Edit"}
              onClick={() => {
                editActivityHandler(activity);
              }}
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
      </Fragment>
    ));

  const compactView = (
    <>
      <h2
        id="manual-input-title"
        className="text-lg font-medium text-gray-900 dark:text-dark-heading"
      >
        Registrations
      </h2>
      <table className="min-w-full divide-y divide-gray-300 table-fixed dark:divide-gray-600">
        <tbody className="text-gray-500 dark:text-slate-400">
          {renderCompactViewTable()}
          <tr>
            <td className="pt-4 px-3 text-sm whitespace-nowrap">
              Total{" "}
              <Tooltip>
                <p
                  data-column="total"
                  className="px-1 py-1 text-sm font-medium text-gray-900 dark:text-dark-heading whitespace-nowrap"
                >
                  {formatDuration(totalDuration)}
                </p>
              </Tooltip>
            </td>
            <td className="px-1 pt-4 text-sm font-medium text-gray-900 dark:text-dark-heading whitespace-nowrap">
              {tableActivities.length > 0 && (
                <TimeBadge
                  hours={totalDuration / MS_PER_HOUR}
                  startTime={tableActivities[0].from}
                  selectedDate={selectedDate}
                />
              )}
            </td>
            <td>{isLoading && <Loader />}</td>
          </tr>
        </tbody>
      </table>
    </>
  );

  if (showAsMain) {
    return mainView;
  }

  return (
    <>
      <div className="lg:hidden">{mainView}</div>
      <div className="hidden lg:block">{compactView}</div>
    </>
  );
}
