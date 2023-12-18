import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { ClockIcon, ExclamationCircleIcon } from "@heroicons/react/24/outline";
import ActivitiesTable from "./ActivitiesTable";
import { ReportActivity } from "../utils/reports";
import { ErrorPlaceholder, RenderError } from "./ui/ErrorPlaceholder";
import { PlusIcon } from "@heroicons/react/24/solid";
import { Square2StackIcon } from "@heroicons/react/24/outline";
import { loadGoogleEventsFromAllUsers } from "../utils/google";
import { getOffice365Events } from "../utils/office365";
import { checkIsToday, getStringDate } from "../utils/datetime-ui";
import ButtonTransparent from "./ui/ButtonTransparent";
import Popup from "./ui/Popup";
import { useMainStore } from "../store/mainStore";
import { shallow } from "zustand/shallow";

type ActivitiesSectionProps = {
  activities: Array<ReportActivity>;
  onEditActivity: (activity: ReportActivity | "new") => void;
  onDeleteActivity: (id: number) => void;
  selectedDate: Date;
  latestProjAndAct: Record<string, [string]>;
  setSelectedDateReport: Dispatch<SetStateAction<String>>;
};

type PlaceholderProps = {
  onEditActivity: (activity: ReportActivity | "new") => void;
  backgroundError: string;
  selectedDate: Date;
  setSelectedDateReport: Dispatch<SetStateAction<String>>;
};

export default function ActivitiesSection({
  onEditActivity,
  activities,
  onDeleteActivity,
  selectedDate,
  latestProjAndAct,
  setSelectedDateReport,
}: ActivitiesSectionProps) {
  const [backgroundError, setBackgroundError] = useState("");
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [renderError, setRenderError] = useState<RenderError>({
    errorTitle: "",
    errorMessage: "",
  });
  const isShowGoogleEvents = JSON.parse(
    localStorage.getItem("showGoogleEvents")
  );
  const isShowOffice365Events = JSON.parse(
    localStorage.getItem("showOffice365Events")
  );
  const ctrlSpaceHandler = (e: KeyboardEvent) => {
    if (e.code === "Space" && e.ctrlKey) {
      onEditActivity("new");
    }
  };

  const loadEvents = async (isAvailable: { isAvailable: boolean }) => {
    if (checkIsToday(selectedDate)) {
      setIsLoading(true);

      const googleEvents = isShowGoogleEvents
        ? await loadGoogleEventsFromAllUsers()
        : [];
      const office365Events = isShowOffice365Events
        ? await getOffice365Events()
        : [];

      const allEvents = [...googleEvents, ...office365Events];

      setIsLoading(false);
      isAvailable.isAvailable && setEvents(allEvents);
    } else {
      setEvents([]);
    }
  };

  useEffect(() => {
    const isAvailable = { isAvailable: true };

    loadEvents(isAvailable);

    global.ipcRenderer.on("window-focused", () => {
      loadEvents(isAvailable);
    });

    return () => {
      setIsLoading(false);
      isAvailable.isAvailable = false;
      global.ipcRenderer.removeAllListeners("window-focused");
    };
  }, [selectedDate]);

  useEffect(() => {
    document.addEventListener("keyup", ctrlSpaceHandler);
    global.ipcRenderer.on("background error", (event, errorMessage, data) => {
      setBackgroundError(errorMessage);
      console.log("Error data ", data);
    });
    global.ipcRenderer.on(
      "render error",
      (event, errorTitle, errorMessage, data) => {
        setRenderError({ errorTitle, errorMessage });
        console.log("Error data ", data);
        console.log(errorTitle);
        console.log(errorMessage);
      }
    );

    return () => {
      document.removeEventListener("keyup", ctrlSpaceHandler);
      global.ipcRenderer.removeAllListeners("background error");
      global.ipcRenderer.removeAllListeners("render or fetch error");
    };
  }, []);

  if (renderError.errorTitle && renderError.errorMessage) {
    return <ErrorPlaceholder {...renderError} />;
  }

  if (!activities?.length && !events?.length && !isLoading) {
    return (
      <Placeholder
        onEditActivity={onEditActivity}
        backgroundError={backgroundError}
        selectedDate={selectedDate}
        setSelectedDateReport={setSelectedDateReport}
      />
    );
  }

  return (
    <div className="flex flex-col justify-between h-full">
      <div>
        {backgroundError && (
          <div className="border-t-4  border-red-700 mx-3 mb-6 p-5 shadow-lg text-gray-700 text-left dark:text-slate-400">
            <div className="flex justify-start gap-2 w-full text-gray-900 font-bold dark:text-white">
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
            latestProjAndAct={latestProjAndAct}
            events={events}
            isLoading={isLoading}
          />
        </div>

        {/* <div className="flex gap-2 px-6 pb-4 items-center justify-end mr-auto">
        {today && isShowGoogleEvents && (
            setShowGoogleEvents={setShowGoogleEvents}
          <GoogleCalendarEventsMessage
            formattedGoogleEvents={formattedGoogleEvents}
        )}
          />
      </div> */}

        <div>
          <button
            id="newActivityBtn"
            className="block w-full px-4 py-4 text-sm font-medium text-center text-blue-500 bg-blue-200 hover:bg-blue-300 sm:rounded-b-lg dark:bg-dark-button-back-gray hover:dark:bg-dark-button-gray-hover dark:text-dark-heading"
            onClick={() => onEditActivity("new")}
          >
            Track more time
            <span className="block text-blue-500 text-xs dark:text-dark-heading">
              click or press ctrl + space
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

function Placeholder({
  onEditActivity,
  backgroundError,
  selectedDate,
  setSelectedDateReport,
}: PlaceholderProps) {
  const [showModal, setShowModal] = useState(false);
  const [reportsFolder, setReportsFolder] = useMainStore(
    (state) => [state.reportsFolder, state.setReportsFolder],
    shallow
  );

  const copyLastReport = async () => {
    const prevDayReport = await global.ipcRenderer.invoke(
      "app:find-last-report",
      reportsFolder,
      getStringDate(selectedDate)
    );

    if (prevDayReport) {
      global.ipcRenderer.invoke(
        "app:write-day-report",
        reportsFolder,
        getStringDate(selectedDate),
        prevDayReport
      );

      setSelectedDateReport(prevDayReport);
    } else {
      setShowModal(true);
    }
  };

  return (
    <div className="py-6 text-center">
      {backgroundError && (
        <div className="border-t-4  border-red-700 mx-3 mb-6 p-5 shadow-lg text-gray-700 dark:text-slate-400 text-left">
          <div className="flex justify-start gap-2 w-full text-gray-900 dark:text-dark-heading font-bold">
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

      <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-dark-heading">
        No tracked time
      </h3>
      <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
        Get started by tracking some activity
      </p>
      <div className="mt-6 mb-2">
        <button
          onClick={() => onEditActivity("new")}
          type="button"
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500   dark:bg-dark-button-back  dark:hover:bg-dark-button-hover"
        >
          <PlusIcon className="w-5 h-5 mr-2 -ml-1" aria-hidden="true" />
          New activity
        </button>
        <span className="block text-gray-500 text-xs">
          or press ctrl + space
        </span>
      </div>
      <ButtonTransparent callback={copyLastReport}>
        <Square2StackIcon className="w-5 h-5" />
        Copy last report
      </ButtonTransparent>
      {showModal && (
        <Popup
          title="Failed to copy last report"
          description="Either the last report is empty or you haven't written it for too long"
          left="25%"
          top="160px"
          buttons={[
            {
              text: "Ok",
              color: "green",
              callback: () => setShowModal(false),
            },
          ]}
        />
      )}
    </div>
  );
}
