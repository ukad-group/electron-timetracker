import { Fragment, useContext } from "react";
import clsx from "clsx";
import Tooltip from "@/shared/Tooltip/Tooltip";
import { checkIsToday, getCeiledTime } from "@/helpers/utils/datetime-ui";
import {
  PencilSquareIcon,
  Square2StackIcon,
} from "@heroicons/react/24/outline";
import { formatDuration } from "@/helpers/utils/reports";
import { PlusIcon } from "@heroicons/react/24/solid";
import { ActivitiesTableContext } from "../context";

const CompactViewTable = () => {
  const {
    tableActivities,
    ctrlPressed,
    copyToClipboardHandle,
    onEditActivity,
    activities,
    selectedDate,
    firstKey,
    secondKey,
    editActivityHandler,
  } = useContext(ActivitiesTableContext);

  return (
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
                "py-1 px-1 rounded-full font-medium bg-red-100 text-red-800 dark:text-red-400 dark:bg-red-400/20 w-fit":
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
                  {formatDuration(activity.duration)}
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
    ))
  );
};

export default CompactViewTable;
