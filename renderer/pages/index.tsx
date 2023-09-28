import { ipcRenderer } from "electron";
import { useCallback, useEffect, useState } from "react";
import { shallow } from "zustand/shallow";
import DateSelector from "../components/DateSelector";
import Header from "../components/Header";
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
import { Calendar } from "../components/Calendar/Calendar";

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

  const visibilitychangeHandler = useCallback(() => {
    const currDate = new Date().toLocaleDateString();
    const lastUsingDate = localStorage.getItem("lastUsingDate");
    if (lastUsingDate && currDate !== lastUsingDate) {
      localStorage.setItem("lastUsingDate", currDate);
      window.location.reload();
    }

    localStorage.setItem("lastUsingDate", currDate);
  }, []);

  useEffect(() => {
    document.addEventListener("visibilitychange", visibilitychangeHandler);
    return () => {
      document.removeEventListener("visibilitychange", visibilitychangeHandler);
    };
  }, []);

  useEffect(() => {
    (async () => {
      const dayReport = await ipcRenderer.invoke(
        "app:read-day-report",
        reportsFolder,
        selectedDate
      );
      setSelectedDateReport(dayReport || "");

      const sortedActAndDesc = await ipcRenderer.invoke(
        "app:find-latest-projects",
        reportsFolder,
        selectedDate
      );
      setLatestProjAndAct(sortedActAndDesc.sortedProjAndAct || {});
      setLatestProjAndDesc(sortedActAndDesc.descriptionsSet || {});
    })();
    ipcRenderer.send("start-file-watcher", reportsFolder, selectedDate);
    ipcRenderer.on("file-changed", (event, data) => {
      if (selectedDateReport != data) {
        setSelectedDateReport(data || "");
      }
    });
    ipcRenderer.on("errorMes", (event, data) => {
      console.log("event ", event);
      console.log("data ", data);
    });
  }, [selectedDate, reportsFolder]);

  useEffect(() => {
    if (selectedDateReport) {
      setReportAndNotes(parseReport(selectedDateReport));
      const activities = parseReport(selectedDateReport)[0];
      setSelectedDateActivities(activities);
      return;
    }
    setSelectedDateActivities([]);
  }, [selectedDateReport]);

  // Save report on change
  useEffect(() => {
    if (shouldAutosave) {
      const serializedReport =
        serializeReport(selectedDateActivities) +
        (!reportAndNotes[1] || reportAndNotes[1].startsWith("undefined")
          ? ""
          : reportAndNotes[1]);
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
    const activityIndex = selectedDateActivities.findIndex(
      (act) => act.id === activity.id
    );

    if (activity.project === "delete") {
      setSelectedDateActivities((activities) => {
        const filtered = activities.filter((act) => act.id !== activity.id);
        if (activityIndex) {
          filtered[activityIndex - 1].to = filtered[activityIndex].from;
        } else if (filtered[activityIndex].isBreak) {
          return filtered.filter(
            (act) => act.id !== filtered[activityIndex].id
          );
        }

        if (filtered.length === activityIndex + 1) {
          filtered[activityIndex - 2].to = filtered[activityIndex - 1].to;
          return filtered.filter(
            (act) => act.id !== filtered[activityIndex - 1].id
          );
        }
        return filtered;
      });
      setShouldAutosave(true);
      return;
    }
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
        const oldActivity = activities[activityIndex];

        if (
          Object.keys(activity).every((key) => {
            return oldActivity[key] === activity[key];
          })
        ) {
          return activities;
        }

        activities[activityIndex] = activity;
        if (activities[activityIndex + 1].isBreak) {
          activities.splice(activityIndex + 1, 1);
        } else if (
          newActTo > stringToMinutes(activities[activityIndex + 1].from)
        ) {
          activities[activityIndex + 1].from = activities[activityIndex].to;
        }

        return [...activities];
      });
      isEdit = true;
    }

    for (let i = 0; i < selectedDateActivities.length; i++) {
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
        continue;
      }

      tempActivities.push(selectedDateActivities[i]);
    }
    tempActivities.forEach(
      (act, i) => (
        (act.id = i + 1), act.isBreak ? (act.to = "") : (act.to = act.to)
      )
    );

    if (tempActivities.length === selectedDateActivities.length && !isEdit) {
      !isPastTime && tempActivities.push(activity);
      setSelectedDateActivities(tempActivities.filter((act) => act.duration));
    }
    if (isPastTime && !isEdit) {
      setSelectedDateActivities(tempActivities);
    }

    setShouldAutosave(true);
  };

  const handleSave = (report: string, shouldAutosave: boolean) => {
    setSelectedDateReport(report);
    setShouldAutosave(shouldAutosave);
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
  return (
    <div className="min-h-full">
      <Header />
      <VersionMessage />
      <main className="py-10">
        <div className="grid max-w-3xl grid-cols-1 gap-6 mx-auto sm:px-6 lg:max-w-[1400px] lg:grid-cols-[31%_31%_auto]">
          {reportsFolder ? (
            <>
              <div className="space-y-6 lg:col-start-1 lg:col-span-2 flex flex-col">
                <section>
                  <div className="bg-white shadow sm:rounded-lg">
                    <DateSelector
                      selectedDate={selectedDate}
                      setSelectedDate={setSelectedDate}
                    />
                  </div>
                </section>
                <section className="flex-grow">
                  <div className="bg-white shadow sm:rounded-lg h-full">
                    <ActivitiesSection
                      activities={selectedDateActivities}
                      onEditActivity={setTrackTimeModalActivity}
                      onDeleteActivity={onDeleteActivity}
                      selectedDate={selectedDate}
                    />
                  </div>
                </section>
              </div>

              <section
                aria-labelledby="manual-input-title"
                className="lg:col-start-3 lg:col-span-1 relative"
              >
                <div className="px-4 py-5 bg-white shadow sm:rounded-lg sm:px-6">
                  <ManualInputForm
                    onSave={handleSave}
                    selectedDateReport={selectedDateReport}
                    selectedDate={selectedDate}
                  />
                </div>
                <UpdateDescription />
              </section>
            </>
          ) : (
            <SelectFolderPlaceholder setFolder={setReportsFolder} />
          )}
          <section className="lg:col-span-2">
            <Calendar
              reportsFolder={reportsFolder}
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
            />
          </section>
        </div>
      </main>
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
    </div>
  );
}
