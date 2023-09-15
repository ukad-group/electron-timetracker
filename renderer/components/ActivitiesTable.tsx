import clsx from "clsx";
import { useMemo } from "react";
import { ReportActivity, formatDuration, validation } from "../utils/reports";
import { checkIsToday, getCeiledTime } from "../utils/datetime-ui";
import {
  Square2StackIcon,
  PencilSquareIcon,
} from "@heroicons/react/24/outline";
import Tooltip from "./ui/Tooltip/Tooltip";

type ActivitiesTableProps = {
  activities: Array<ReportActivity>;
  onEditActivity: (activity: ReportActivity) => void;
  selectedDate: Date;
};
const msPerHour = 60 * 60 * 1000;
export default function ActivitiesTable({
  activities,
  onEditActivity,
  selectedDate,
}: ActivitiesTableProps) {
  const nonBreakActivities = useMemo(() => {
    return validation(
      activities.filter((activity) => !activity.isBreak && activity.project)
    );
  }, [activities]);

  const totalDuration = useMemo(() => {
    return nonBreakActivities.reduce((value, activity) => {
      return value + (activity.duration ? activity.duration : 0);
    }, 0);
  }, [nonBreakActivities]);

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

  return (
    <table className="min-w-full divide-y divide-gray-300 table-fixed">
      <thead>
        <tr>
          <th
            scope="col"
            className="w-24 pb-6 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6 md:pl-0"
          >
            Interval
          </th>
          <th
            scope="col"
            className="w-24 pb-6 px-3 text-left text-sm font-semibold text-gray-900"
          >
            Duration
          </th>
          <th
            scope="col"
            className="w-32 pb-6 px-3 text-left text-sm font-semibold text-gray-900 relative"
          >
            <span className="block absolute text-xs text-gray-500 top-[22px]">
              activity
            </span>
            Project
          </th>
          <th
            scope="col"
            className="pb-6 px-3 text-left text-sm font-semibold text-gray-900"
          >
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
      <tbody className="divide-y divide-gray-200">
        {nonBreakActivities.map((activity) => (
          <tr key={activity.id}>
            <td className="py-4 pl-4 pr-3 text-sm text-gray-500 whitespace-nowrap sm:pl-6 md:pl-0">
              <span
                className={clsx({
                  "py-1 px-2 -mx-2 rounded-full font-medium bg-red-100 text-red-800":
                    !activity.isValid,
                })}
              >
                {activity.from} - {activity.to}
              </span>
            </td>
            <td
              className={`px-3 py-4 text-sm font-medium text-gray-900 whitespace-nowrap `}
            >
              <Tooltip>
                <p data-column="duration" onClick={copyToClipboardHandle}>
                  {formatDuration(activity.duration)}
                </p>
              </Tooltip>
            </td>
            <td className="px-3 py-4">
              <Tooltip>
                <p
                  className="text-sm font-medium text-gray-900"
                  onClick={copyToClipboardHandle}
                >
                  {activity.project}
                </p>
              </Tooltip>
              {activity.activity && (
                <Tooltip>
                  <p
                    className="block text-xs text-gray-500 font-semibold mt-1"
                    onClick={copyToClipboardHandle}
                  >
                    {activity.activity}
                  </p>
                </Tooltip>
              )}
            </td>
            <td className="px-3 py-4 text-sm text-gray-500 ">
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
                  <span className="block text-xs text-gray-500 mt-1">
                    Perhaps you wanted to report a break
                  </span>
                )}
              </Tooltip>
            </td>
            <td className="relative py-4 pl-3 pr-4 text-sm font-medium text-right whitespace-nowrap sm:pr-6 md:pr-0">
              <a
                href="#"
                className="text-grey-300 hover:text-blue-600"
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
                <Square2StackIcon className="w-[18px] h-[18px] text-gray-600 hover:text-gray-900" />
              </a>
            </td>
            <td className="relative py-4 pl-3 pr-4 text-sm font-medium text-right whitespace-nowrap sm:pr-6 md:pr-0">
              <a
                href="#"
                className="text-blue-600 hover:text-blue-900"
                onClick={() => onEditActivity(activity)}
              >
                <PencilSquareIcon className="w-[18px] h-[18px] text-gray-600 hover:text-gray-900" />
              </a>
            </td>
          </tr>
        ))}
        <tr>
          <td className="py-4 pl-4 pr-3 text-sm text-gray-500 whitespace-nowrap sm:pl-6 md:pl-0">
            <p>Total</p>
          </td>
          <td
            className="px-3 py-4 text-sm font-medium text-gray-900 whitespace-nowrap"
            onClick={copyToClipboardHandle}
          >
            <Tooltip>
              <p data-column="total">{formatDuration(totalDuration)}</p>
            </Tooltip>
          </td>
          <td
            className="px-3 py-4 text-sm font-medium text-gray-900 whitespace-nowrap"
            colSpan={4}
          >
            {totalDuration < 8 * msPerHour && getLackBadge(totalDuration)}
          </td>
        </tr>
      </tbody>
    </table>
  );
}

function getLackBadge(hours: number) {
  const curDate = new Date();
  const curTime = parseInt(
    curDate.getHours() + "" + ("0" + curDate.getMinutes()).substr(-2)
  );

  if (hours < 6 * msPerHour && curTime > 1600) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
        less than 6h
      </span>
    );
  }

  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
      less than 8h
    </span>
  );
}
