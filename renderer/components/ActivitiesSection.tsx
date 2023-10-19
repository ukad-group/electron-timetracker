import { useEffect, useState } from "react";
import { ClockIcon, ExclamationCircleIcon } from "@heroicons/react/24/outline";
import ActivitiesTable from "./ActivitiesTable";
import { ReportActivity } from "../utils/reports";
import { ErrorPlaceholder, RenderError } from "./ui/ErrorPlaceholder";
import { PlusIcon } from "@heroicons/react/24/solid";
import { useGoogleCalendarStore } from "../store/googleCalendarStore";
import { calcDurationBetweenTimes } from "../utils/reports";
import { checkIsToday, getTimeFromGoogleObj } from "../utils/datetime-ui";
import GoogleCalendarShowCheckbox from "./google-calendar/GoogleCalendarShowCheckbox";

type ActivitiesSectionProps = {
  activities: Array<ReportActivity>;
  onEditActivity: (activity: ReportActivity | "new") => void;
  onDeleteActivity: (id: number) => void;
  selectedDate: Date;
};

type PlaceholderProps = {
  onEditActivity: (activity: ReportActivity | "new") => void;
  backgroundError: string;
};

export default function ActivitiesSection({
  onEditActivity,
  activities,
  onDeleteActivity,
  selectedDate,
}: ActivitiesSectionProps) {
  const [backgroundError, setBackgroundError] = useState("");
  const [renderError, setRenderError] = useState<RenderError>({
    errorTitle: "",
    errorMessage: "",
  });
  const { googleEvents, isLogged } = useGoogleCalendarStore();
  const [showGoogleEvents, setShowGoogleEvents] = useState(false);
  const [formattedGoogleEvents, setFormattedGoogleEvents] = useState([]);
  const today = checkIsToday(selectedDate);

  const keydownHandler = (e: KeyboardEvent) => {
    if (e.code === "Space" && e.ctrlKey) {
      onEditActivity("new");
    }
  };

  useEffect(() => {
    if (!today) setShowGoogleEvents(false);
  }, [selectedDate]);

  useEffect(() => {
    if (googleEvents.length === 0) return;

    if (showGoogleEvents === false) setFormattedGoogleEvents([]);

    const formattedEvents = googleEvents
      .filter((googleEvent) => {
        if (
          googleEvent?.start?.dateTime &&
          googleEvent?.end?.dateTime &&
          !googleEvent?.isAdded
        ) {
          return googleEvent;
        }
      })
      .map((googleEvent) => {
        const { start, end } = googleEvent;
        const from = getTimeFromGoogleObj(start.dateTime);
        const to = getTimeFromGoogleObj(end.dateTime);

        return {
          from: from,
          to: to,
          duration: calcDurationBetweenTimes(from, to),
          project: "",
          activity: "",
          description: googleEvent.summary || "",
          isValid: true,
          calendarId: googleEvent.id,
        };
      });

    setFormattedGoogleEvents(formattedEvents);
  }, [showGoogleEvents, googleEvents]);

  useEffect(() => {
    document.addEventListener("keydown", keydownHandler);
    global.ipcRenderer.on("background error", (event, errorMessage, data) => {
      setBackgroundError(errorMessage);
      console.log("Error data ", data);
    });
    global.ipcRenderer.on(
      "render error",
      (event, errorTitle, errorMessage, data) => {
        setRenderError({ errorTitle, errorMessage });
        console.log("Error data ", data);
      }
    );

    return () => {
      document.removeEventListener("keydown", keydownHandler);
      global.ipcRenderer.removeAllListeners("background error");
      global.ipcRenderer.removeAllListeners("render error");
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
          onDeleteActivity={onDeleteActivity}
          selectedDate={selectedDate}
          formattedGoogleEvents={
            showGoogleEvents &&
            googleEvents.length > 0 &&
            formattedGoogleEvents.length > 0
              ? formattedGoogleEvents
              : undefined
          }
        />
      </div>

      <div className="flex gap-2 px-6 pb-4 items-center justify-end mr-auto">
        {today && isLogged && (
          <GoogleCalendarShowCheckbox
            setShowGoogleEvents={setShowGoogleEvents}
          />
        )}
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
