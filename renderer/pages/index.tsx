import { SetStateAction, useEffect, useState } from "react";
import DateSelector from "../components/DateSelector";
import ActivitiesTable from "../components/ActivitiesTable";
import Header from "../components/Header";
import { ipcRenderer } from "electron";
import { ReportActivity, parseReport, serializeReport } from "../utils/reports";
import TrackTimeModal from "../components/TrackTimeModal";
import ManualInputForm from "../components/ManualInputForm";

export default function Home() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedDateReport, setSelectedDateReport] = useState("");
  const [selectedDateActivities, setSelectedDateActivities] =
    useState<Array<ReportActivity> | null>([]);
  const [trackTimeModalActivity, setTrackTimeModalActivity] = useState(null);

  useEffect(() => {
    (async () => {
      const dayReport = await ipcRenderer.invoke(
        "app:read-day-report",
        selectedDate
      );
      setSelectedDateReport(dayReport || "");
    })();
  }, [selectedDate]);

  useEffect(() => {
    if (selectedDateReport) {
      const activities = parseReport(selectedDateReport);
      setSelectedDateActivities(activities);
      return;
    }
    setSelectedDateActivities([]);
  }, [selectedDateReport]);

  // Save report on change
  useEffect(() => {
    if (
      JSON.stringify(selectedDateActivities) !==
      JSON.stringify(parseReport(selectedDateReport))
    ) {
      const serializedReport = serializeReport(selectedDateActivities);
      saveSerializedReport(serializedReport);
    }
  }, [selectedDateActivities]);

  const saveSerializedReport = (serializedReport: string) => {
    ipcRenderer.invoke("app:write-day-report", selectedDate, serializedReport);
    setSelectedDateReport(serializedReport);
  };

  const submitActivity = (activity: ReportActivity) => {
    if (activity.id === null) {
      setSelectedDateActivities((activities) => [
        ...activities,
        {
          ...activity,
          id: activities.reduce((id, curr) => {
            if (curr.id >= id) return curr.id + 1;
            return id;
          }, 0),
        },
      ]);
      return;
    }

    setSelectedDateActivities((activities) => {
      const activityIndex = activities.findIndex(
        (act) => act.id === activity.id
      );
      activities[activityIndex] = activity;
      return [...activities];
    });
  };

  return (
    <div className="min-h-full">
      <Header />

      <main className="py-10">
        <div className="grid max-w-3xl grid-cols-1 gap-6 mx-auto sm:px-6 lg:max-w-7xl lg:grid-flow-col-dense lg:grid-cols-3">
          <div className="space-y-6 lg:col-start-1 lg:col-span-2">
            <section>
              <DateSelector
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
              />
            </section>
            <section>
              <div className="bg-white shadow sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6">
                  <ActivitiesTable
                    onEditActivity={setTrackTimeModalActivity}
                    activities={selectedDateActivities}
                  />
                </div>
                <div>
                  <a
                    href="#"
                    className="block px-4 py-4 text-sm font-medium text-center text-gray-500 bg-gray-50 hover:text-gray-700 sm:rounded-b-lg"
                    onClick={() => setTrackTimeModalActivity(true)}
                  >
                    Track more time
                  </a>
                </div>
              </div>
            </section>
          </div>

          <section
            aria-labelledby="manual-input-title"
            className="lg:col-start-3 lg:col-span-1"
          >
            <div className="px-4 py-5 bg-white shadow sm:rounded-lg sm:px-6">
              <ManualInputForm
                onSave={setSelectedDateReport}
                selectedDateReport={selectedDateReport}
              />
            </div>
          </section>
        </div>
      </main>
      <TrackTimeModal
        isOpen={trackTimeModalActivity !== null}
        editedActivity={trackTimeModalActivity}
        close={() => setTrackTimeModalActivity(null)}
        submitActivity={submitActivity}
      />
    </div>
  );
}
