import { useEffect, useState } from "react";
import { DateSelector } from "@/components/DateSelector";
import { ManualInputForm } from "@/components/ManualInputForm";
import { Calendar } from "@/components/Calendar/Calendar";
import { Totals } from "@/components/Totals";
import { Bookings } from "@/components/Bookings";
import { ActivitiesSection } from "@/components/ActivitiesSection";
import { SelectFolderPlaceholder } from "@/components/SelectFolderPlaceholder";
import { UpdateDescription } from "@/components/UpdateDescription";
import { useMainStore } from "@/store/mainStore";
import { useBetaStore } from "@/store/betaUpdatesStore";
import { shallow } from "zustand/shallow";
import { parseReport, serializeReport, ReportAndNotes } from "@/helpers/utils/reports";
import useScreenSizes from "@/helpers/hooks/useScreenSizes";
import { IPC_MAIN_CHANNELS } from "@electron/helpers/constants";
import { LOCAL_STORAGE_VARIABLES } from "@/helpers/contstants";
import { SCREENS } from "@/constants";
import { MainPageProps } from "./types";

const MainPage = ({
  selectedDate,
  selectedDateActivities,
  setSelectedDateActivities,
  shouldAutosave,
  setShouldAutosave,
  setSelectedDate,
  latestProjAndAct,
  setTrackTimeModalActivity,
}: MainPageProps) => {
  const [isDropboxConnected, setIsDropboxConnected] = useState(true);
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [reportAndNotes, setReportAndNotes] = useState<any[] | ReportAndNotes>([]);
  const [selectedDateReport, setSelectedDateReport] = useState("");
  const { screenSizes } = useScreenSizes();
  const isManualInputMain = localStorage.getItem("is-manual-input-main-section") === "true";
  const showBookings = !!JSON.parse(localStorage.getItem(LOCAL_STORAGE_VARIABLES.TIMETRACKER_USER));
  const [reportsFolder] = useMainStore((state) => [state.reportsFolder, state.setReportsFolder], shallow);
  const [isBeta] = useBetaStore((state) => [state.isBeta, state.setIsBeta], shallow);

  useEffect(() => {
    global.ipcRenderer.send(IPC_MAIN_CHANNELS.START_FOLDER_WATCHER, reportsFolder);
    global.ipcRenderer.send(IPC_MAIN_CHANNELS.CHECK_DROPBOX_CONNECTION);
    if (reportsFolder) {
      global.ipcRenderer.on(IPC_MAIN_CHANNELS.CHECK_DROPBOX_CONNECTION, (event, data) => {
        setIsDropboxConnected(!reportsFolder.includes("Dropbox") || data);
      });
    }
    global.ipcRenderer.send(IPC_MAIN_CHANNELS.BETA_CHANNEL, isBeta);

    return () => {
      global.ipcRenderer.removeAllListeners(IPC_MAIN_CHANNELS.CHECK_DROPBOX_CONNECTION);
      global.ipcRenderer.send(IPC_MAIN_CHANNELS.STOP_PATH_WATCHER, reportsFolder);
    };
  }, []);

  useEffect(() => {
    try {
      if (shouldAutosave) {
        const serializedReport =
          serializeReport(selectedDateActivities) +
          (!reportAndNotes[1] || reportAndNotes[1].startsWith("undefined") ? "" : reportAndNotes[1]);

        saveSerializedReport(serializedReport);
        setShouldAutosave(false);
      }
    } catch (err) {
      global.ipcRenderer.send(
        IPC_MAIN_CHANNELS.FRONTEND_ERROR,
        "Reports saving error",
        "An error occurred while saving reports. ",
        err,
      );
    }
  }, [selectedDateActivities]);

  useEffect(() => {
    if (selectedDateReport?.length > 0) {
      const parsedReportsAndNotes = parseReport(selectedDateReport);
      const parsedActivities = parsedReportsAndNotes[0];

      setReportAndNotes(parsedReportsAndNotes);
      setSelectedDateActivities(parsedActivities);
      return;
    }

    setReportAndNotes([]);
    setSelectedDateActivities([]);
  }, [selectedDateReport]);

  useEffect(() => {
    readDayReport();
    global.ipcRenderer.send(IPC_MAIN_CHANNELS.START_FILE_WATCHER, reportsFolder, selectedDate);

    global.ipcRenderer.on(IPC_MAIN_CHANNELS.FILE_CHANGED, (event, data) => {
      if (selectedDateReport != data) {
        setSelectedDateReport(data || "");
      }
    });

    return () => {
      global.ipcRenderer.removeAllListeners(IPC_MAIN_CHANNELS.FILE_CHANGED);
      global.ipcRenderer.send(IPC_MAIN_CHANNELS.STOP_PATH_WATCHER, reportsFolder, selectedDate);
    };
  }, [selectedDate, reportsFolder]);

  const readDayReport = async () => {
    const dayReport = await global.ipcRenderer.invoke(IPC_MAIN_CHANNELS.READ_DAY_REPORT, reportsFolder, selectedDate);

    setSelectedDateReport(dayReport || "");
  };

  const handleSave = (report: string, shouldAutosave: boolean) => {
    setSelectedDateReport(report);
    setShouldAutosave(shouldAutosave);
  };

  const saveSerializedReport = (serializedReport: string) => {
    global.ipcRenderer.send(IPC_MAIN_CHANNELS.CHECK_DROPBOX_CONNECTION);
    global.ipcRenderer.invoke("app:write-day-report", reportsFolder, selectedDate, serializedReport);
    setSelectedDateReport(serializedReport);
  };
  const onDeleteActivity = (id: number) => {
    setSelectedDateActivities((activities) => {
      const newActivities = activities.map((activity) => {
        if (activity.id === id) {
          activity.isBreak = true;
          activity.description = "";
          activity.activity = "";
          activity.project = "!removed";
        }
        return activity;
      });
      return newActivities;
    });
    setShouldAutosave(true);
  };

  return (
    <div className="grid max-w-3xl grid-cols-1 gap-6 mx-auto sm:px-6 lg:max-w-[1400px] lg:grid-cols-[31%_31%_auto]">
      {reportsFolder ? (
        <>
          <div className="lg:col-start-1 lg:col-span-2 flex flex-col gap-6">
            <section className="bg-white shadow sm:rounded-lg dark:bg-dark-container dark:border dark:border-dark-border">
              <DateSelector
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
                isDropboxConnected={isDropboxConnected}
                selectedDateReport={selectedDateReport}
              />
            </section>

            {!isManualInputMain && (
              <section className="bg-white shadow sm:rounded-lg h-full dark:bg-dark-container dark:border dark:border-dark-border">
                <ActivitiesSection
                  activities={selectedDateActivities}
                  onEditActivity={setTrackTimeModalActivity}
                  onDeleteActivity={onDeleteActivity}
                  selectedDate={selectedDate}
                  latestProjAndAct={latestProjAndAct}
                  setSelectedDateReport={setSelectedDateReport}
                  showAsMain={!isManualInputMain}
                />
              </section>
            )}

            {isManualInputMain && (
              <section className="px-4 py-5 bg-white shadow sm:rounded-lg sm:px-6 dark:bg-dark-container dark:border dark:border-dark-border">
                <ManualInputForm
                  onSave={handleSave}
                  selectedDateReport={selectedDateReport}
                  selectedDate={selectedDate}
                  setSelectedDateReport={setSelectedDateReport}
                />
              </section>
            )}
            {screenSizes.screenWidth >= SCREENS.LG && (
              <section className="lg:col-span-2">
                <Calendar
                  reportsFolder={reportsFolder}
                  selectedDate={selectedDate}
                  setSelectedDate={setSelectedDate}
                  calendarDate={calendarDate}
                  setCalendarDate={setCalendarDate}
                />
              </section>
            )}
          </div>

          <aside className="lg:col-start-3 lg:col-span-1 lg:row-span-2 relative flex flex-col gap-6">
            {isManualInputMain && (
              <section className="bg-white shadow sm:rounded-lg dark:bg-dark-container dark:border dark:border-dark-border">
                <ActivitiesSection
                  activities={selectedDateActivities}
                  onEditActivity={setTrackTimeModalActivity}
                  onDeleteActivity={onDeleteActivity}
                  selectedDate={selectedDate}
                  latestProjAndAct={latestProjAndAct}
                  setSelectedDateReport={setSelectedDateReport}
                  showAsMain={!isManualInputMain}
                />
              </section>
            )}

            {!isManualInputMain && (
              <section className="px-4 py-5 bg-white shadow sm:rounded-lg sm:px-6 dark:bg-dark-container dark:border dark:border-dark-border">
                <ManualInputForm
                  onSave={handleSave}
                  selectedDateReport={selectedDateReport}
                  selectedDate={selectedDate}
                  setSelectedDateReport={setSelectedDateReport}
                />
              </section>
            )}

            <Totals selectedDate={selectedDate} />

            {showBookings && <Bookings calendarDate={calendarDate} />}

            {screenSizes.screenWidth < SCREENS.LG && (
              <section className="lg:col-span-2">
                <Calendar
                  reportsFolder={reportsFolder}
                  selectedDate={selectedDate}
                  setSelectedDate={setSelectedDate}
                  calendarDate={calendarDate}
                  setCalendarDate={setCalendarDate}
                />
              </section>
            )}

            <section>
              <UpdateDescription />
            </section>
          </aside>
        </>
      ) : (
        <SelectFolderPlaceholder />
      )}
    </div>
  );
};

export default MainPage;
