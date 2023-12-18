import React, { useState, useEffect, useMemo } from "react";
import { useMainStore } from "../store/mainStore";
import { shallow } from "zustand/shallow";
import { MONTHS } from "../utils/datetime-ui";
import { ReportActivity, formatDuration, parseReport } from "../utils/reports";
import { ParsedReport, TTUserInfo } from "./Calendar/Calendar";
import Loader from "./ui/Loader";

type BookingsProps = {
  calendarDate: Date;
};

export type BookingFromApi = {
  name: string;
  plans: Array<{
    hours: number;
  }>;
};

type BookedSpentStat = {
  project: string;
  booked: number;
  spent: number;
};

const Bookings = ({ calendarDate }: BookingsProps) => {
  const [isTimetrackerLogged, setIsTimetrackerLogged] = useState(false);
  const [bookedProjects, setBookedProjects] = useState<BookingFromApi[]>([]);
  const [bookedSpentStatistic, setBookedSpentStatistic] = useState<
    BookedSpentStat[]
  >([]);
  const [loading, setLoading] = useState(false);
  const currentReadableMonth = MONTHS[calendarDate.getMonth()];
  const [reportsFolder] = useMainStore(
    (state) => [state.reportsFolder, state.setReportsFolder],
    shallow
  );
  let maxRecurse = 0;

  const totalBookingTime: number = useMemo(() => {
    return bookedProjects.reduce(
      (acc, project) => acc + project?.plans[0]?.hours,
      0
    );
  }, [bookedProjects]);

  const totalSpentTime: number = useMemo(() => {
    return bookedSpentStatistic.reduce(
      (acc, project) => acc + project?.spent,
      0
    );
  }, [bookedSpentStatistic]);

  const getBookings = async (
    cookie: string,
    userName: string
  ): Promise<BookingFromApi[]> => {
    try {
      setLoading(true);

      const allLoggedProjects = await global.ipcRenderer.invoke(
        "timetracker:get-bookings",
        cookie,
        userName,
        calendarDate
      );

      if (allLoggedProjects === "invalid_token" && maxRecurse <= 3) {
        maxRecurse += 1; // we are already refreshing the token in calendar compenent, so i just want to re execute function maximum 3 times to prevent loop

        const updatedTTUserInfo: TTUserInfo = JSON.parse(
          localStorage.getItem("timetracker-user")
        );
        const updatedCookie = updatedTTUserInfo?.TTCookie;

        return await getBookings(updatedCookie, userName);
      } else if (allLoggedProjects === "invalid_token") {
        // cases when we can't update token after 3 attempts
        return [];
      }

      maxRecurse = 0;

      const bookedProjects = allLoggedProjects.filter(
        (projects: BookingFromApi) => projects?.plans[0]?.hours !== 0
      );

      return bookedProjects;
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const getMonthLocalActivities = async (): Promise<ReportActivity[]> => {
    try {
      const monthLocalReports = await global.ipcRenderer.invoke(
        "app:find-month-projects",
        reportsFolder,
        calendarDate
      );

      const monthParsedActivities = monthLocalReports.map(
        (report: ParsedReport) => {
          const activities = (parseReport(report?.data)[0] || []).filter(
            (activity: ReportActivity) => !activity.isBreak
          );

          return activities;
        }
      );

      return monthParsedActivities.flat();
    } catch (error) {
      console.log(error);
    }
  };

  const getBookedStatistic = async () => {
    const TTUserInfo: TTUserInfo = JSON.parse(
      localStorage.getItem("timetracker-user")
    );

    if (!TTUserInfo) return;

    setIsTimetrackerLogged(true);

    const timetrackerCookie = TTUserInfo?.TTCookie;
    const timetrackerUserName = TTUserInfo?.name;

    const bookedProjects = await getBookings(
      timetrackerCookie,
      timetrackerUserName
    );

    if (!bookedProjects || bookedProjects?.length === 0) {
      setBookedProjects([]);
      setBookedSpentStatistic([]);
      return;
    }

    setBookedProjects(bookedProjects);

    const monthLocalActivities = await getMonthLocalActivities();

    const bookedSpentStatisticArray: BookedSpentStat[] = bookedProjects
      .map((booking) => {
        const spentProjectTime = monthLocalActivities.reduce(
          (acc, activity) => {
            if (activity?.project === booking?.name) {
              return acc + activity?.duration;
            } else {
              return acc;
            }
          },
          0
        );

        return {
          project: booking?.name,
          booked: booking?.plans[0]?.hours,
          spent: spentProjectTime,
        };
      })
      .sort((a, b) => {
        const nameA = a.project.toLowerCase();
        const nameB = b.project.toLowerCase();

        if (nameA < nameB) {
          return -1;
        } else if (nameA > nameB) {
          return 1;
        } else {
          return 0;
        }
      });

    setBookedSpentStatistic(bookedSpentStatisticArray);
  };

  useEffect(() => {
    getBookedStatistic();

    const fileChangeListener = (event) => {
      getBookedStatistic();
    };

    global.ipcRenderer.on("any-file-changed", fileChangeListener);

    return () => {
      global.ipcRenderer.removeListener("any-file-changed", fileChangeListener);
    };
  }, [calendarDate]);

  return (
    <div className="relative px-4 py-5 bg-white shadow sm:rounded-lg sm:px-6 dark:bg-dark-container dark:border dark:border-dark-border">
      <h2 className="text-lg font-medium text-gray-900 dark:text-dark-heading mb-2">
        Bookings in {currentReadableMonth}
      </h2>
      {loading && (
        <div className="absolute top-5 right-4">
          <Loader />
        </div>
      )}
      {isTimetrackerLogged ? (
        <div className="relative overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-gray-900 dark:text-dark-heading border-b dark:border-gray-700">
              <tr>
                <th scope="col" className="pr-6 py-3 font-semibold">
                  Project
                </th>
                <th scope="col" className="px-6 py-3 font-semibold">
                  Booked
                </th>
                <th scope="col" className="px-6 py-3 font-semibold">
                  Spent
                </th>
              </tr>
            </thead>
            <tbody>
              {bookedSpentStatistic.map((project, i) => (
                <tr key={i} className="border-b dark:border-gray-700">
                  <td className="pr-6 py-2 text-gray-700 dark:text-dark-main">
                    {project.project}
                  </td>
                  <td className="px-6 py-2 text-gray-700 dark:text-dark-main">
                    {project.booked}h
                  </td>
                  <td className="px-6 py-2 text-gray-700 dark:text-dark-main">
                    {formatDuration(project.spent)}
                  </td>
                </tr>
              ))}
              <tr>
                <td className="pr-6 py-2 text-gray-700 dark:text-dark-main ">
                  Total:
                </td>
                <td className="px-6 py-2 text-gray-700 dark:text-dark-main">
                  {totalBookingTime}h
                </td>
                <td className="px-6 py-2 text-gray-700 dark:text-dark-main">
                  {formatDuration(totalSpentTime)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-700 dark:text-dark-main text-sm">
          To see booked hours, you need to log in to the timetracker website on
          settings page
        </p>
      )}
    </div>
  );
};

export default Bookings;
