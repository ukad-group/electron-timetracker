import clsx from "clsx";
import { app, ipcRenderer } from "electron";
import { useEffect, useState } from "react";
import { shallow } from "zustand/shallow";
import DateSelector from "../components/DateSelector";
import Header from "../components/Header";
import {
  ReportActivity,
  parseReport,
  serializeReport,
  ReportAndNotes,
} from "../utils/reports";
import TrackTimeModal from "../components/TrackTimeModal";
import ManualInputForm from "../components/ManualInputForm";
import ActivitiesSection from "../components/ActivitiesSection";
import SelectFolderPlaceholder from "../components/SelectFolderPlaceholder";
import { useMainStore } from "../store/mainStore";
import { useUpdateStore } from "../store/updateStore";

export default function Home() {
  const [reportsFolder, setReportsFolder] = useMainStore(
    (state) => [state.reportsFolder, state.setReportsFolder],
    shallow
  );

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedDateReport, setSelectedDateReport] = useState("");
  const [selectedDateActivities, setSelectedDateActivities] =
    useState<Array<ReportActivity> | null>([]);
  const [shouldAutosave, setShouldAutosave] = useState(false);
  const [trackTimeModalActivity, setTrackTimeModalActivity] = useState<
    ReportActivity | "new"
  >(null);
  const [latestProjAndAct, setLatestProjAndAct] = useState<
    Record<string, [string]>
  >({});
  const [reportAndNotes, setReportAndNotes] = useState<any[] | ReportAndNotes>(
    []
  );

  const [update, setUpdate] = useUpdateStore(
    (state) => [state.update, state.setUpdate],
    shallow
  );
  const [isUpdate, setIsUpdate] = useState(false);
  const [isDownload, setIsDownload] = useState(false);
  const [version, setVersion] = useState("");
  const [currentVersion, setCurrentVersion] = useState(app?.getVersion());

  useEffect(() => {
    ipcRenderer.send("start-update-watcher");
    ipcRenderer.on("update-available", (event, data, info) => {
      setIsUpdate(data);
      setVersion(info.version);
    });
    ipcRenderer.on("downloaded", (event, data, info) => {
      setIsDownload(data);
      setVersion(info.version);
    });
    ipcRenderer.on("current-version", (event, data) => {
      setCurrentVersion(data);
    });
  }, []);

  const install = () => {
    setUpdate("new");
    ipcRenderer.send("install");
  };
  useEffect(() => {
    (async () => {
      const dayReport = await ipcRenderer.invoke(
        "app:read-day-report",
        reportsFolder,
        selectedDate
      );
      setSelectedDateReport(dayReport || "");

      setLatestProjAndAct(
        await ipcRenderer.invoke(
          "app:find-latest-projects",
          reportsFolder,
          selectedDate
        )
      );
    })();
    ipcRenderer.send("start-file-watcher", reportsFolder, selectedDate);
    ipcRenderer.on("file-changed", (event, data) => {
      if (selectedDateReport != data) {
        setSelectedDateReport(data || "");
      }
    });
  }, [selectedDate, reportsFolder]);

  useEffect(() => {
    if (selectedDateReport) {
      setReportAndNotes(parseReport(selectedDateReport));
      const activities = parseReport(selectedDateReport)[0];
      setSelectedDateActivities(activities.filter((act) => !act.isBreak));
      return;
    }
    setSelectedDateActivities([]);
  }, [selectedDateReport]);

  // Save report on change
  useEffect(() => {
    if (shouldAutosave) {
      const serializedReport =
        serializeReport(selectedDateActivities) +
        (reportAndNotes[1].startsWith("undefined") ? "" : reportAndNotes[1]);
      saveSerializedReport(serializedReport);
      setShouldAutosave(false);
    }
  }, [selectedDateActivities]);

  const saveSerializedReport = (serializedReport: string) => {
    ipcRenderer.invoke(
      "app:write-day-report",
      reportsFolder,
      selectedDate,
      serializedReport
    );
    setSelectedDateReport(serializedReport);
  };

  const submitActivity = (activity: ReportActivity) => {
    let isEdit = false;
    let isPastTime = false;
    const tempActivities: Array<ReportActivity> = [];
    const newActTime = stringToMinutes(activity.from);
    const activityIndex = selectedDateActivities.findIndex(
      (act) => act.id === activity.id
    );
    if (!selectedDateActivities.length) {
      activity.id = 1;
      tempActivities.push(activity);
      setSelectedDateActivities(tempActivities);
    }

    if (activityIndex >= 0) {
      setSelectedDateActivities((activities) => {
        activities[activityIndex] = activity;
        return [...activities];
      });
      isEdit = true;
    }

    for (let i = 0; i < selectedDateActivities.length; i++) {
      const indexActTime = stringToMinutes(selectedDateActivities[i].from);
      if (newActTime < indexActTime) {
        tempActivities.push(activity);
        isPastTime = true;
      }
      if (!i && newActTime < indexActTime) {
        tempActivities.push(...selectedDateActivities);
        break;
      }
      tempActivities.push(selectedDateActivities[i]);
    }

    tempActivities.forEach((act, i) => (act.id = i + 1));
    if (tempActivities.length === selectedDateActivities.length && !isEdit) {
      tempActivities.push(activity);
      setSelectedDateActivities(tempActivities.filter((act) => act.duration));
    }
    if (isPastTime && !isEdit) {
      setSelectedDateActivities(tempActivities);
    }

    setShouldAutosave(true);
  };

  const stringToMinutes = (string: string) => {
    const [hours, minutes] = string.split(":");
    return Number(hours) * 60 + Number(minutes);
  };

  const handleSave = (report: string, shouldAutosave: boolean) => {
    setSelectedDateReport(report);
    setShouldAutosave(shouldAutosave);
  };

  const isUpdateToggle = () => {
    if (update === "old") {
      setUpdate("new");
    } else {
      setUpdate("old");
    }
  };

  return (
    <div className="min-h-full">
      <Header />
      <div className="absolute items-center flex-shrink-0 p-2 text-xs text-gray-700 font-semibold lg:px-0">
        Current version {currentVersion} {!isUpdate && "(latest)"}
      </div>
      <div className="flex justify-center pt-2 h-16">
        <div className="flex gap-2 items-center flex-shrink-0 px-2 lg:px-0">
          {isUpdate && !isDownload && (
            <span className="flex gap-2 items-center rounded-lg px-3 py-2 bg-blue-300 text-blue-800">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="#60A4FA"
                viewBox="0 0 24 24"
                strokeWidth="1"
                stroke="white"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
                />
              </svg>
              The version {version} is loading
            </span>
          )}
          {isDownload && (
            <span className="flex gap-2 items-center rounded-lg px-3 py-2 text-sm bg-green-300 text-green-800">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="#166534"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4.5 12.75l6 6 9-13.5"
                />
              </svg>
              <p className="whitespace-normal">
                New version {version} is downloaded. Turn off the app, or click
                the Install button
              </p>
              <button
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                onClick={install}
              >
                Install
              </button>
            </span>
          )}
        </div>
      </div>
      <main className="py-5">
        <div className="grid max-w-3xl grid-cols-1 gap-6 mx-auto sm:px-6 lg:max-w-7xl lg:grid-flow-col-dense lg:grid-cols-3">
          {reportsFolder ? (
            <>
              <div className="space-y-6 lg:col-start-1 lg:col-span-2">
                <section>
                  <div className="bg-white shadow sm:rounded-lg">
                    <DateSelector
                      selectedDate={selectedDate}
                      setSelectedDate={setSelectedDate}
                    />
                  </div>
                </section>
                <section>
                  <div className="bg-white shadow sm:rounded-lg">
                    <ActivitiesSection
                      activities={selectedDateActivities}
                      onEditActivity={setTrackTimeModalActivity}
                    />
                  </div>
                </section>
              </div>

              <section
                aria-labelledby="manual-input-title"
                className="lg:col-start-3 lg:col-span-1"
              >
                <div className="px-4 py-5 bg-white shadow sm:rounded-lg sm:px-6">
                  <ManualInputForm
                    onSave={handleSave}
                    selectedDateReport={selectedDateReport}
                  />
                </div>

                <div
                  className={clsx(
                    "h-14 px-4 py-5 my-6 bg-white shadow overflow-hidden transition-all ease-linear duration-300 sm:rounded-lg sm:px-6",
                    {
                      "animate-[dropdown_500ms_ease-in-out_forwards]":
                        update === "new",
                    },
                    {
                      "animate-[dropup_500ms_ease-in-out_forwards]":
                        update === "old",
                    }
                  )}
                >
                  <div>
                    <div className="flex justify-between">
                      <h2
                        id="manual-input-title"
                        className="text-lg font-medium text-gray-900"
                      >
                        What's new in this update
                      </h2>
                      <button
                        onClick={isUpdateToggle}
                        className={clsx(
                          "transform transition-transform ease-linear duration-300",
                          {
                            "rotate-180": update === "new",
                          }
                        )}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth="1.5"
                          stroke="currentColor"
                          className="w-6 h-6"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3"
                          />
                        </svg>
                      </button>
                    </div>

                    <ul className="mt-3 h-32  overflow-y-auto">
                      <li>
                        Neeeeeeeeeeeeeeeeeeeeeeeew
                        Versiooooooooooooooooooooooooooon
                        teeeeeeeeeeeeeeeeeeeeeeeest
                      </li>
                    </ul>
                  </div>
                </div>
              </section>
            </>
          ) : (
            <SelectFolderPlaceholder setFolder={setReportsFolder} />
          )}
        </div>
      </main>
      <TrackTimeModal
        activities={selectedDateActivities}
        isOpen={trackTimeModalActivity !== null}
        editedActivity={trackTimeModalActivity}
        latestProjAndAct={latestProjAndAct}
        close={() => setTrackTimeModalActivity(null)}
        submitActivity={submitActivity}
      />
    </div>
  );
}
