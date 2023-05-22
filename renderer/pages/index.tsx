import { SetStateAction, useEffect, useState } from "react";
import DateSelector from "../components/DateSelector";
import ActivitiesTable from "../components/ActivitiesTable";
import Header from "../components/Header";
import { ipcRenderer } from "electron";
import { ReportActivity, parseReport } from "../utils/reports";
import TrackTimeModal from "../components/TrackTimeModal";

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

  const submitActivity = (activity: ReportActivity) => {
    if (activity.id === null) {
      setSelectedDateActivitiesAndSave((activities) => [
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

    setSelectedDateActivitiesAndSave((activities) => {
      const activityIndex = activities.findIndex(
        (act) => act.id === activity.id
      );
      activities[activityIndex] = activity;
      return [...activities];
    });
  };

  const setSelectedDateActivitiesAndSave = (
    value: SetStateAction<Array<ReportActivity>>
  ) => {
    setSelectedDateActivities(value);
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
              <h2
                id="manual-input-title"
                className="text-lg font-medium text-gray-900"
              >
                Manual input
              </h2>

              <textarea
                readOnly
                value={selectedDateReport}
                rows={10}
                className="block w-full px-3 py-2 mt-3 border border-gray-300 rounded-md shadow-sm focus-visible:outline-blue-500 sm:text-sm"
                defaultValue={""}
                spellCheck={false}
              />
              <div className="flex flex-col mt-6 justify-stretch">
                <button
                  type="button"
                  className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Save
                </button>
              </div>
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
