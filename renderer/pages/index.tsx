import { useEffect, useState } from "react";
import { shallow } from "zustand/shallow";
import DateSelector from "../components/DateSelector";
import {
  ReportActivity,
  parseReport,
  serializeReport,
  ReportAndNotes,
  stringToMinutes,
} from "../utils/reports";
import TrackTimeModal from "../components/TrackTimeModal/TrackTimeModal";
import ManualInputForm from "../components/ManualInputForm";
import ActivitiesSection from "../components/ActivitiesSection";
import SelectFolderPlaceholder from "../components/SelectFolderPlaceholder";
import VersionMessage from "../components/ui/VersionMessages";
import UpdateDescription from "../components/UpdateDescription";
import { useMainStore } from "../store/mainStore";
import { useThemeStore } from "../store/themeStore";
import { Calendar } from "../components/Calendar/Calendar";
import Link from "next/link";
import { Cog8ToothIcon } from "@heroicons/react/24/solid";
import { getStringDate } from "../utils/datetime-ui";
import Totals from "../components/Totals";

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
  const [latestProjAndDesc, setLatestProjAndDesc] = useState<
    Record<string, [string]>
  >({});
  const [reportAndNotes, setReportAndNotes] = useState<any[] | ReportAndNotes>(
    []
  );
  const [lastRenderedDay, setLastRenderedDay] = useState(new Date().getDate());
  const [isOSDarkTheme, setIsOSDarkTheme] = useState(true);
  const [isDropboxConnected, setIsDropboxConnected] = useState(true);
  const [theme, setTheme] = useThemeStore(
    (state) => [state.theme, state.setTheme],
    shallow
  );

  function handleThemeChange(e) {
    if (e.matches) {
      setIsOSDarkTheme(true);
    } else {
      setIsOSDarkTheme(false);
    }
  }

  useEffect(() => {
    global.ipcRenderer.send("check-dropbox-connection");
    global.ipcRenderer.on("dropbox-connection", (event, data) => {
      setIsDropboxConnected(data);
    });

    return () => {
      global.ipcRenderer.removeAllListeners("dropbox-connection");
    };
  }, []);

  useEffect(() => {
    const checkDayChange = () => {
      const currentDay = new Date().getDate();
      if (currentDay !== lastRenderedDay) {
        setLastRenderedDay(currentDay);
        setSelectedDate(new Date());
      }
    };

    const intervalId = setInterval(checkDayChange, 1000);

    return () => clearInterval(intervalId);
  }, [lastRenderedDay]);

  useEffect(() => {
    window
      .matchMedia("(prefers-color-scheme: dark)")
      .addListener(handleThemeChange);

    const mode =
      (theme.os && isOSDarkTheme) || theme.custom === "dark"
        ? "dark bg-dark-back"
        : "light bg-grey-100";

    document.body.className = mode;
  }, [theme, isOSDarkTheme]);

  useEffect(() => {
    try {
      (async () => {
        const dayReport = await global.ipcRenderer.invoke(
          "app:read-day-report",
          reportsFolder,
          getStringDate(selectedDate)
        );

        setSelectedDateReport(dayReport || "");

        const sortedActAndDesc = await global.ipcRenderer.invoke(
          "app:find-latest-projects",
          reportsFolder,
          getStringDate(selectedDate)
        );

        setLatestProjAndAct(sortedActAndDesc.sortedProjAndAct || {});
        setLatestProjAndDesc(sortedActAndDesc.descriptionsSet || {});
      })();
    } catch (err) {
      global.ipcRenderer.send(
        "front error",
        "Reports reading error",
        "An error occurred while reading reports. ",
        err
      );
    }
    global.ipcRenderer.send("start-file-watcher", reportsFolder, selectedDate);
    global.ipcRenderer.on("file-changed", (event, data) => {
      if (selectedDateReport != data) {
        setSelectedDateReport(data || "");
      }
    });
    global.ipcRenderer.on("errorMes", (event, data) => {
      console.log("event ", event);
      console.log("data ", data);
    });

    return () => {
      global.ipcRenderer.removeAllListeners("file-changed");
      global.ipcRenderer.removeAllListeners("errorMes");
      global.ipcRenderer.send("stop-path-watcher", reportsFolder, selectedDate);
    };
  }, [selectedDate, reportsFolder, lastRenderedDay]);

  useEffect(() => {
    if (selectedDateReport?.length > 0) {
      const parsedReportsAndNotes = parseReport(selectedDateReport);
      const parsedActivities = parsedReportsAndNotes[0];

      setReportAndNotes(parsedReportsAndNotes);
      setSelectedDateActivities(parsedActivities);
      return;
    }

    setSelectedDateActivities([]);
  }, [selectedDateReport]);

  // Save report on change
  useEffect(() => {
    try {
      if (shouldAutosave) {
        const serializedReport =
          serializeReport(selectedDateActivities) +
          (!reportAndNotes[1] || reportAndNotes[1].startsWith("undefined")
            ? ""
            : reportAndNotes[1]);

        saveSerializedReport(serializedReport);
        setShouldAutosave(false);
      }
    } catch (err) {
      global.ipcRenderer.send(
        "front error",
        "Reports saving error",
        "An error occurred while saving reports. ",
        err
      );
    }
  }, [selectedDateActivities]);

  const saveSerializedReport = (serializedReport: string) => {
    global.ipcRenderer.invoke(
      "app:write-day-report",
      reportsFolder,
      getStringDate(selectedDate),
      serializedReport
    );
    setSelectedDateReport(serializedReport);
  };

  const submitActivity = (activity: ReportActivity) => {
    let isEdit = false;
    let isPastTime = false;
    const activityIndex = selectedDateActivities.findIndex(
      (act) => act.id === activity.id
    );

    // if (activity.project === "delete") {
    //   setSelectedDateActivities((activities) => {
    //     if (activities.length === activityIndex + 2 && !activityIndex) {
    //       return [];
    //     }
    //     if (
    //       activities[activityIndex + 1].isBreak &&
    //       activities.length !== activityIndex + 2
    //     ) {
    //       activities = activities.filter(
    //         (act) => act.id !== activities[activityIndex + 1].id
    //       );
    //     }
    //     if (activityIndex) {
    //       activities[activityIndex - 1].to = activities[activityIndex + 1].from;
    //     } else if (activities[activityIndex].isBreak) {
    //       return activities.filter(
    //         (act) => act.id !== activities[activityIndex].id
    //       );
    //     }

    //     if (activities.length === activityIndex + 2) {
    //       activities[activityIndex - 1].to = activities[activityIndex].from;
    //       if (activities[activityIndex - 1].isBreak) {
    //         return activities.filter(
    //           (act) =>
    //             act.id !== activities[activityIndex].id &&
    //             act.id !== activities[activityIndex + 1].id &&
    //             act.id !== activities[activityIndex - 1].id
    //         );
    //       }
    //       return activities.filter(
    //         (act) =>
    //           act.id !== activities[activityIndex].id &&
    //           act.id !== activities[activityIndex + 1].id
    //       );
    //     }
    //     const filtered = activities.filter((act) => act.id !== activity.id);
    //     return filtered;
    //   });
    //   setShouldAutosave(true);
    //   return;
    // }
    const tempActivities: Array<ReportActivity> = [];
    const newActFrom = stringToMinutes(activity.from);
    const newActTo = stringToMinutes(activity.to);

    if (!selectedDateActivities.length) {
      activity.id = 1;
      tempActivities.push(activity);
      setSelectedDateActivities(tempActivities);
    }

    if (activityIndex >= 0) {
      setSelectedDateActivities((activities) => {
        try {
          const oldActivity = activities[activityIndex];

          if (
            Object.keys(activity).every((key) => {
              return oldActivity[key] === activity[key];
            })
          ) {
            return activities;
          }

          activities[activityIndex] = activity;

          if (
            activities[activityIndex - 1] &&
            activities[activityIndex - 1].isBreak
          ) {
            activities[activityIndex - 1].to = activity.from;
            if (activities[activityIndex - 1]?.from === activity.from) {
              activities.splice(activityIndex - 1, 1);
            }
          }

          if (
            activities[activityIndex + 1] &&
            activities[activityIndex + 1].isBreak
          ) {
            activities[activityIndex + 1].from = activity.to;
            if (
              activities[activityIndex + 2] &&
              activities[activityIndex + 2]?.from === activity.to
            ) {
              activities.splice(activityIndex + 1, 1);
            }
          } else if (
            activities[activityIndex + 1] &&
            newActTo > stringToMinutes(activities[activityIndex + 1].from)
          ) {
            activities[activityIndex + 1].from = activities[activityIndex].to;
          }

          return [...activities];
        } catch (err) {
          global.ipcRenderer.send(
            "front error",
            "Activity editing error",
            "An error occurred while editing reports. ",
            err
          );
          return [...activities];
        }
      });

      isEdit = true;
    }

    if (isEdit) {
      setShouldAutosave(true);
      return;
    }

    for (let i = 0; i < selectedDateActivities.length; i++) {
      try {
        const indexActFrom = stringToMinutes(selectedDateActivities[i].from);

        if (newActFrom < indexActFrom && !isPastTime) {
          tempActivities.push(activity);
          isPastTime = true;
        }
        if (!i && newActFrom < indexActFrom) {
          tempActivities.push(...selectedDateActivities);
          break;
        }
        if (newActFrom === indexActFrom) {
          tempActivities.push(activity);
          isPastTime = true;
          activity.isValid = true;
          continue;
        }
      } catch (err) {
        global.ipcRenderer.send(
          "front error",
          "Adding activity error",
          "An error occurred when adding a new activity to the report. ",
          err
        );
        console.log(activity);
      }
      tempActivities.push(selectedDateActivities[i]);
    }

    tempActivities.forEach(
      (act, i) => (
        (act.id = i), act.isBreak ? (act.to = "") : (act.to = act.to)
      )
    );

    try {
      if (tempActivities.length === selectedDateActivities.length && !isEdit) {
        !isPastTime && tempActivities.push(activity);
        setSelectedDateActivities(tempActivities.filter((act) => act.duration));
      }

      if (isPastTime && !isEdit) {
        setSelectedDateActivities(tempActivities);
      }
    } catch (err) {
      global.ipcRenderer.send(
        "front error",
        "Adding activity error",
        "An error occurred when adding a new activity to the report. ",
        err
      );
      console.log(activity);
    }
    setShouldAutosave(true);
  };

  const onDeleteActivity = (id: number) => {
    submitActivity({
      id: id,
      from: "",
      to: "",
      duration: 0,
      project: "delete",
    });
  };

  const handleSave = (report: string, shouldAutosave: boolean) => {
    setSelectedDateReport(report);
    setShouldAutosave(shouldAutosave);
  };

  return (
    <div className="h-full bg-gray-100 dark:bg-dark-back">
      <span
        title={
          isDropboxConnected
            ? "Dropbox is connected"
            : "Dropbox is not connected"
        }
      >
        <svg
          className="p-2 "
          fill={isDropboxConnected ? "#007FE6" : "#64748b"}
          height="35px"
          width="35px"
          version="1.1"
          id="Layer_1"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="-271 282 256 238"
        >
          <g>
            <polygon points="-271,414.5 -195.7,463.6 -143,419.7 -218.9,372.8 	" />
            <polygon points="-195.7,282 -271,331.1 -218.9,372.8 -143,325.9 	" />
            <polygon points="-15,331.1 -90.3,282 -143,325.9 -67.1,372.8 	" />
            <polygon points="-143,419.7 -90.3,463.6 -15,414.5 -67.1,372.8 	" />
            <polygon points="-142.8,429.1 -195.7,473 -218.3,458.2 -218.3,474.8 -142.8,520 -67.4,474.8 -67.4,458.2 -90,473 	" />
          </g>
        </svg>
      </span>
      <VersionMessage />
      <main className="py-10">
        <div className="grid max-w-3xl grid-cols-1 gap-6 mx-auto sm:px-6 lg:max-w-[1400px] lg:grid-cols-[31%_31%_auto]">
          {reportsFolder ? (
            <>
              <div className="space-y-6 lg:col-start-1 lg:col-span-2 flex flex-col">
                <section>
                  <div className="bg-white shadow sm:rounded-lg dark:bg-dark-container dark:border dark:border-dark-border">
                    <DateSelector
                      selectedDate={selectedDate}
                      setSelectedDate={setSelectedDate}
                    />
                  </div>
                </section>
                <section className="flex-grow">
                  <div className="bg-white shadow sm:rounded-lg h-full dark:bg-dark-container dark:border dark:border-dark-border">
                    <ActivitiesSection
                      activities={selectedDateActivities}
                      onEditActivity={setTrackTimeModalActivity}
                      onDeleteActivity={onDeleteActivity}
                      selectedDate={selectedDate}
                      availableProjects={
                        latestProjAndAct ? Object.keys(latestProjAndAct) : []
                      }
                    />
                  </div>
                </section>
              </div>

              <section
                aria-labelledby="manual-input-title"
                className="lg:col-start-3 lg:col-span-1 lg:row-span-2 relative"
              >
                <div className="flex flex-col gap-6">
                  <div className="px-4 py-5 bg-white shadow sm:rounded-lg sm:px-6 dark:bg-dark-container dark:border dark:border-dark-border">
                    <ManualInputForm
                      onSave={handleSave}
                      selectedDateReport={selectedDateReport}
                      selectedDate={selectedDate}
                    />
                  </div>

                  <div className="px-4 py-5 bg-white shadow sm:rounded-lg sm:px-6 dark:bg-dark-container dark:border dark:border-dark-border">
                    <Totals activities={selectedDateActivities} />
                  </div>
                  <UpdateDescription />
                </div>
              </section>
              <section className="lg:col-span-2">
                <Calendar
                  reportsFolder={reportsFolder}
                  selectedDate={selectedDate}
                  setSelectedDate={setSelectedDate}
                />
              </section>
            </>
          ) : (
            <SelectFolderPlaceholder setFolder={setReportsFolder} />
          )}
        </div>
        <Link
          href="/settings"
          className="z-20 h-12 w-12 bg-blue-950 rounded-full fixed right-10 bottom-10 flex items-center justify-center transition-colors duration-300 hover:bg-blue-800 hover:before:flex before:content-['Settings'] before:hidden before:absolute before:-translate-x-full before:text-blue-950 before:font-bold before:dark:text-blue-700/50"
        >
          <span className="w-8 flex items-center justify-center text-white ">
            <Cog8ToothIcon />
          </span>
        </Link>
      </main>
      {trackTimeModalActivity && (
        <TrackTimeModal
          activities={selectedDateActivities}
          isOpen={trackTimeModalActivity !== null}
          editedActivity={trackTimeModalActivity}
          latestProjAndAct={latestProjAndAct}
          latestProjAndDesc={latestProjAndDesc}
          close={() => setTrackTimeModalActivity(null)}
          submitActivity={submitActivity}
          selectedDate={selectedDate}
        />
      )}
    </div>
  );
}
