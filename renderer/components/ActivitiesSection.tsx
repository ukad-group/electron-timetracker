import { useEffect } from "react";
import { ClockIcon } from "@heroicons/react/24/outline";
import ActivitiesTable from "./ActivitiesTable";
import { ReportActivity } from "../utils/reports";
import { PlusIcon } from "@heroicons/react/24/solid";

type ActivitiesSectionProps = {
  activities: Array<ReportActivity>;
  onEditActivity: (activity: ReportActivity | "new") => void;
  selectedDate: Date;
};

type PlaceholderProps = Pick<ActivitiesSectionProps, "onEditActivity">;

export default function ActivitiesSection({
  onEditActivity,
  activities,
  selectedDate,
}: ActivitiesSectionProps) {
  const keydownHandler = (e: KeyboardEvent) => {
    if (e.code === "Space" && e.ctrlKey) {
      onEditActivity("new");
    }
  };

  useEffect(() => {
    document.addEventListener("keydown", keydownHandler);

    return () => {
      document.removeEventListener("keydown", keydownHandler);
    };
  }, []);

  if (!activities?.length) {
    return activities ? (
      <Placeholder onEditActivity={onEditActivity} />
    ) : (
      <ErrorPlaceholder />
    );
  }

  return (
    <div>
      <div className="px-4 py-5 sm:px-6">
        <ActivitiesTable
          onEditActivity={onEditActivity}
          activities={activities}
          selectedDate={selectedDate}
        />
      </div>
      <div>
        <button
          className="block w-full px-4 py-4 text-sm font-medium text-center text-blue-500 bg-blue-200 hover:bg-blue-300  sm:rounded-b-lg"
          onClick={() => onEditActivity("new")}
        >
          Track more time
          <span className="block text-blue-500 text-xs">
            click or press ctrl + space
          </span>
        </button>
      </div>
    </div>
  );
}

function Placeholder({ onEditActivity }: PlaceholderProps) {
  return (
    <div className="py-6 text-center">
      <ClockIcon
        className="w-12 h-12 mx-auto text-gray-400"
        aria-hidden="true"
      />

      <h3 className="mt-2 text-sm font-medium text-gray-900">
        No tracked time
      </h3>
      <p className="mt-1 text-sm text-gray-500">
        Get started by tracking some activity
      </p>
      <div className="mt-6">
        <button
          onClick={() => onEditActivity("new")}
          type="button"
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <PlusIcon className="w-5 h-5 mr-2 -ml-1" aria-hidden="true" />
          New activity
        </button>
        <span className="block text-gray-500 text-xs">
          or press ctrl + space
        </span>
      </div>
    </div>
  );
}
function ErrorPlaceholder() {
  return (
    <div className="py-16 text-center bg-white shadow sm:rounded-lg lg:col-start-1 lg:col-span-3">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
        className="w-12 h-12 mx-auto text-red-500"
      >
        <path
          fillRule="evenodd"
          d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
          clipRule="evenodd"
        ></path>
      </svg>
      <h3 className="mt-2 text-sm font-medium text-gray-900">Parsing Error</h3>
      <p className="mt-1 text-sm text-gray-500">
        There is something wrong with the file. Try to correct the error in the
        report in the Manual Input field.
      </p>
    </div>
  );
}
