import { useEffect, useMemo, useState } from "react";
import { ExclamationCircleIcon } from "@heroicons/react/24/outline";
import { ActivitiesTable } from "../ActivitiesTable";
import { ErrorPlaceholder, RenderError } from "@/shared/ErrorPlaceholder";
import { loadGoogleEventsFromAllUsers } from "@/helpers/utils/google";
import { getOffice365Events } from "@/helpers/utils/office365";
import { checkIsToday } from "@/helpers/utils/datetime-ui";
import { ActivitiesSectionProps } from "./types";
import { XMarkIcon } from "@heroicons/react/24/solid";
import { validation } from "@/helpers/utils/reports";
import { IPC_MAIN_CHANNELS } from "@electron/helpers/constants";
import Placeholder from "./Placeholder";
import TrackTimeButton from "./TrackTimeButton";
import { RELEASES_LINK } from "./constants";
import { LOCAL_STORAGE_VARIABLES, KEY_CODES } from "@/helpers/constants";

const ActivitiesSection = ({
  onEditActivity,
  activities,
  selectedDate,
  latestProjAndAct,
  setSelectedDateReport,
}: ActivitiesSectionProps) => {
  const [backgroundError, setBackgroundError] = useState("");
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [renderError, setRenderError] = useState<RenderError>({
    errorTitle: "",
    errorMessage: "",
  });
  const [errorType, setErrorType] = useState<null | "updater">(null);
  const [isErrorShown, setIsErrorShown] = useState<boolean>(true);
  const isGoogleEventsShown = JSON.parse(localStorage.getItem(LOCAL_STORAGE_VARIABLES.SHOW_GOOGLE_EVENTS));
  const isOffice365EventsShown = JSON.parse(localStorage.getItem(LOCAL_STORAGE_VARIABLES.SHOW_OFFICE_365_EVENTS));
  const validatedActivities = useMemo(() => {
    return validation(activities.filter((activity) => activity.to));
  }, [activities]);

  const handleCtrlSpace = (e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.code === KEY_CODES.SPACE) {
      onEditActivity("new");
    }
  };

  const loadEvents = async (isAvailable: { isAvailable: boolean }) => {
    if (checkIsToday(selectedDate)) {
      setIsLoading(true);

      const googleEvents = isGoogleEventsShown ? await loadGoogleEventsFromAllUsers() : [];
      const office365Events = isOffice365EventsShown ? await getOffice365Events() : [];

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

    global.ipcRenderer.on(IPC_MAIN_CHANNELS.WINDOW_FOCUSED, () => {
      loadEvents(isAvailable);
    });

    return () => {
      setIsLoading(false);
      isAvailable.isAvailable = false;
      global.ipcRenderer.removeAllListeners(IPC_MAIN_CHANNELS.WINDOW_FOCUSED);
    };
  }, [selectedDate]);

  useEffect(() => {
    document.addEventListener("keyup", handleCtrlSpace);
    global.ipcRenderer.on(IPC_MAIN_CHANNELS.BACKEND_ERROR, (_, errorMessage, data) => {
      setBackgroundError(errorMessage);
      console.log("Error data ", data);

      const errorMessageArray = errorMessage ? errorMessage.split(" ") : [];
      if (errorMessageArray.includes("Updater")) {
        setErrorType("updater");
      }
    });

    global.ipcRenderer.on(IPC_MAIN_CHANNELS.RENDER_ERROR, (_, errorTitle, errorMessage, data) => {
      setRenderError({ errorTitle, errorMessage });
      console.log("Error data ", data);
    });

    return () => {
      document.removeEventListener("keyup", handleCtrlSpace);
      global.ipcRenderer.removeAllListeners(IPC_MAIN_CHANNELS.BACKEND_ERROR);
      global.ipcRenderer.removeAllListeners(IPC_MAIN_CHANNELS.RENDER_ERROR);
    };
  }, []);

  const handleUpdateDownloadClick = () => {
    global.ipcRenderer.send(IPC_MAIN_CHANNELS.REDIRECT, RELEASES_LINK);
  };

  const handleCloseButton = () => {
    setIsErrorShown(false);
  };

  if (renderError.errorTitle && renderError.errorMessage) {
    return <ErrorPlaceholder {...renderError} />;
  }

  if (!validatedActivities?.length && !events?.length && !isLoading) {
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
        {backgroundError && isErrorShown && (
          <div className="relative border-t-4 border-red-700 mx-3 mb-6 p-5 shadow-lg text-gray-700 text-left dark:text-slate-400">
            <div className="flex justify-start gap-2 w-full text-gray-900 font-bold dark:text-white">
              <ExclamationCircleIcon className="w-7 h-7 text-red-700" aria-hidden="true" />
              <p>Noncritical error</p>
            </div>
            <div className="pl-9 pr-8">
              {backgroundError} Refer to the console for specific error information.{" "}
              {errorType === "updater" && (
                <button
                  className="text-dark-button-back hover:text-dark-button-hover"
                  onClick={handleUpdateDownloadClick}
                >
                  You can download the new version manually from the link
                </button>
              )}
              <XMarkIcon
                className="w-6 h-6 fill-gray-600 dark:fill-gray-400/70 absolute right-1 top-1 cursor-pointer"
                onClick={handleCloseButton}
              />
            </div>
          </div>
        )}
        <div className="px-4 py-5 sm:px-6">
          <ActivitiesTable
            onEditActivity={onEditActivity}
            activities={activities}
            selectedDate={selectedDate}
            latestProjAndAct={latestProjAndAct}
            events={events}
            isLoading={isLoading}
            validatedActivities={validatedActivities}
          />
        </div>
        <div>
          <TrackTimeButton onEditActivity={onEditActivity} />
        </div>
      </div>
    </div>
  );
};

export default ActivitiesSection;
