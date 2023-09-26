import { useEffect, useState } from "react";
import { ipcRenderer } from "electron";
import { ClockIcon, ExclamationCircleIcon } from "@heroicons/react/24/outline";
import ActivitiesTable from "./ActivitiesTable";
import { ReportActivity } from "../utils/reports";
import { ErrorPlaceholder, RenderError } from "./ui/ErrorPlaceholder";
import { PlusIcon } from "@heroicons/react/24/solid";

type ActivitiesSectionProps = {
  activities: Array<ReportActivity>;
  onEditActivity: (activity: ReportActivity | "new") => void;
  selectedDate: Date;
};

type PlaceholderProps = {
  onEditActivity: (activity: ReportActivity | "new") => void;
  backgroundError: string;
};

export default function ActivitiesSection({
  onEditActivity,
  activities,
  selectedDate,
}: ActivitiesSectionProps) {
  const [backgroundError, setBackgroundError] = useState("");
  const [renderError, setRenderError] = useState<RenderError>({
    errorTitle: "",
    errorMessage: "",
  });

  const keydownHandler = (e: KeyboardEvent) => {
    if (e.code === "Space" && e.ctrlKey) {
      onEditActivity("new");
    }
  };

  useEffect(() => {
    document.addEventListener("keydown", keydownHandler);
    ipcRenderer.on("background error", (event, errorMessage, data) => {
      setBackgroundError(errorMessage);
      console.log("Error data ", data);
    });
    ipcRenderer.on("render error", (event, errorTitle, errorMessage, data) => {
      setRenderError({ errorTitle, errorMessage });
      console.log("Error data ", data);
    });
    return () => {
      document.removeEventListener("keydown", keydownHandler);
    };
  }, []);

  if (renderError.errorTitle && renderError.errorMessage) {
    return <ErrorPlaceholder {...renderError} />;
  }

  if (!activities?.length && activities) {
    return (
      <Placeholder
        onEditActivity={onEditActivity}
        backgroundError={backgroundError}
      />
    );
  }

  return (
    <div>
      {backgroundError && (
        <div className="border-t-4  border-red-700 mx-3 mb-6 p-5 shadow-lg text-gray-700 text-left">
          <div className="flex justify-start gap-2 w-full text-gray-900 font-bold">
            <ExclamationCircleIcon
              className="w-7 h-7 text-red-700"
              aria-hidden="true"
            />
            <p>Noncritical error</p>
          </div>
          <div className="pl-9 pr-8">
            {backgroundError} Refer to the console for specific error
            information.
          </div>
        </div>
      )}
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

function Placeholder({ onEditActivity, backgroundError }: PlaceholderProps) {
  return (
    <div className="py-6 text-center">
      {backgroundError && (
        <div className="border-t-4  border-red-700 mx-3 mb-6 p-5 shadow-lg text-gray-700 text-left">
          <div className="flex justify-start gap-2 w-full text-gray-900 font-bold">
            <ExclamationCircleIcon
              className="w-7 h-7 text-red-700"
              aria-hidden="true"
            />
            <p>Noncritical error</p>
          </div>
          <div className="pl-9 pr-8">
            {backgroundError} Refer to the console for specific error
            information.
          </div>
        </div>
      )}
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
