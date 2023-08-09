import { ipcRenderer } from "electron";
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
  const [latestProjects, setLatestProjects] = useState<Array<string>>([]);
  const [reportAndNotes, setReportAndNotes] = useState<any[] | ReportAndNotes>(
    []
  );

  useEffect(() => {
    (async () => {
      const dayReport = await ipcRenderer.invoke(
        "app:read-day-report",
        reportsFolder,
        selectedDate
      );
      setSelectedDateReport(dayReport || "");

      setLatestProjects(
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
        serializeReport(selectedDateActivities) + reportAndNotes[1];
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

  return (
    <div className="min-h-full">
      <Header />

      <main className="py-10">
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
              </section>
            </>
          ) : (
            <SelectFolderPlaceholder setFolder={setReportsFolder} />
          )}
        </div>
      </main>
      <TrackTimeModal
        isOpen={trackTimeModalActivity !== null}
        editedActivity={trackTimeModalActivity}
        latestProjects={latestProjects}
        close={() => setTrackTimeModalActivity(null)}
        submitActivity={submitActivity}
      />
    </div>
  );
}
