import { useMemo } from "react";
import { ReportActivity } from "../utils/reports";

type ActivitiesTableProps = {
  activities: Array<ReportActivity>;
};

export default function ActivitiesTable({ activities }: ActivitiesTableProps) {
  const nonBreakActivities = useMemo(
    () => activities.filter((activity) => !activity.isBreak),
    [activities]
  );

  const totalDuration = useMemo(() => {
    return nonBreakActivities.reduce((value, activity) => {
      return value + activity.duration;
    }, 0);
  }, [nonBreakActivities]);

  return (
    <table className="min-w-full divide-y divide-gray-300 table-fixed">
      <thead>
        <tr>
          <th
            scope="col"
            className="w-24 pb-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6 md:pl-0"
          >
            Interval
          </th>
          <th
            scope="col"
            className="w-24 pb-3.5 px-3 text-left text-sm font-semibold text-gray-900"
          >
            Duration
          </th>
          <th
            scope="col"
            className="pb-3.5 px-3 text-left text-sm font-semibold text-gray-900"
          >
            Project
          </th>
          <th
            scope="col"
            className="pb-3.5 px-3 text-left text-sm font-semibold text-gray-900"
          >
            Activity
          </th>
          <th
            scope="col"
            className="pb-3.5 px-3 text-left text-sm font-semibold text-gray-900"
          >
            Description
          </th>
          <th scope="col" className="relative pb-3.5 pl-3 pr-4 sm:pr-6 md:pr-0">
            <span className="sr-only">Edit</span>
          </th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200">
        {nonBreakActivities.map((activity) => (
          <tr key={activity.id}>
            <td className="py-4 pl-4 pr-3 text-sm text-gray-500 whitespace-nowrap sm:pl-6 md:pl-0">
              {activity.from} - {activity.to}
            </td>
            <td className="px-3 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">
              {formatDuration(activity.duration)}
            </td>
            <td className="px-3 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">
              {activity.project}
            </td>
            <td className="px-3 py-4 text-sm font-medium text-gray-900">
              {activity.activity}
            </td>
            <td className="px-3 py-4 text-sm text-gray-500">
              {activity.description}
            </td>
            <td className="relative py-4 pl-3 pr-4 text-sm font-medium text-right whitespace-nowrap sm:pr-6 md:pr-0">
              <a href="#" className="text-blue-600 hover:text-blue-900">
                Edit
              </a>
            </td>
          </tr>
        ))}
        <tr>
          <td className="py-4 pl-4 pr-3 text-sm text-gray-500 whitespace-nowrap sm:pl-6 md:pl-0">
            Total
          </td>
          <td className="px-3 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">
            {formatDuration(totalDuration)}
          </td>
          <td
            className="px-3 py-4 text-sm font-medium text-gray-900 whitespace-nowrap"
            colSpan={4}
          >
            {totalDuration < 8 && getLackBadge(totalDuration)}
          </td>
        </tr>
      </tbody>
    </table>
  );
}

function formatDuration(hours: number): string {
  if (hours < 1) {
    const minutes = Math.round(hours * 60);
    return `${minutes}m`;
  } else {
    return `${Math.floor(hours * 10) / 10}h`;
  }
}

function getLackBadge(hours: number) {
  if (hours < 6) {
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
