import {
  extractDatesFromPeriod,
  isTheSameDates,
  saveToLocalStorageTransitPeriod,
} from "../../utils/datetime-ui";
import { DayOff, ApiDayOff, TTUserInfo } from "./Calendar";

type VacationSickDaysData = {
  periods: ApiDayOff[];
};

export const loadHolidaysAndVacations = async (calendarDate: Date) => {
  try {
    const timetrackerUserInfo: TTUserInfo = JSON.parse(
      localStorage.getItem("timetracker-user")
    );

    if (!timetrackerUserInfo) return;

    const plannerToken = timetrackerUserInfo?.plannerAccessToken;
    const userPromises = [];

    const holidaysPromise: Promise<ApiDayOff[]> = global.ipcRenderer.invoke(
      "timetracker:get-holidays",
      plannerToken,
      calendarDate
    );

    const userEmail = timetrackerUserInfo?.email;
    const vacationsPromise: Promise<VacationSickDaysData> =
      global.ipcRenderer.invoke(
        "timetracker:get-vacations",
        plannerToken,
        userEmail,
        calendarDate
      );

    userPromises.push(holidaysPromise, vacationsPromise);

    const userFetchedData = await Promise.all(userPromises);

    if (userFetchedData.includes("invalid_token")) {
      const refreshToken = timetrackerUserInfo?.plannerRefreshToken;

      const refreshedPlannerCreds = await global.ipcRenderer.invoke(
        "timetracker:refresh-planner-token",
        refreshToken
      );

      const refreshedUserInfo = {
        ...timetrackerUserInfo,
        plannerAccessToken: refreshedPlannerCreds?.access_token,
      };

      localStorage.setItem(
        "timetracker-user",
        JSON.stringify(refreshedUserInfo)
      );
      loadHolidaysAndVacations(calendarDate);
      return;
    }
    const holidays: ApiDayOff[] = userFetchedData[0];
    const vacationsAndSickdays: ApiDayOff[] = userFetchedData[1]?.periods;
    const userDaysOff: DayOff[] = [];

    holidays.forEach((holiday) => {
      userDaysOff.push({
        date: new Date(holiday?.dateFrom),
        duration: holiday?.quantity,
        description: holiday?.description,
        type: "holiday",
      });
    });

    const transitVacations = JSON.parse(
      localStorage.getItem("transit-vacation")
    );

    if (transitVacations) {
      transitVacations.forEach((transitDay) => {
        if (
          userDaysOff.some((day) => isTheSameDates(day.date, transitDay.date))
        ) {
          return;
        }

        userDaysOff.push(transitDay);
      });
    }

    vacationsAndSickdays.forEach((item) => {
      if (
        userDaysOff.some((dayoff) =>
          isTheSameDates(dayoff.date, new Date(item.dateFrom))
        )
      ) {
        return;
      }

      const singleDayOff = isTheSameDates(
        new Date(item.dateFrom),
        new Date(item.dateTo)
      );

      if (singleDayOff) {
        userDaysOff.push({
          date: new Date(item?.dateFrom),
          duration: item?.quantity,
          description: item?.description,
          type: item?.type === 1 ? "sickday" : "vacation",
        });
      } else {
        const yearFrom = new Date(item?.dateFrom).getFullYear();
        const yearTo = new Date(item?.dateTo).getFullYear();

        if (yearFrom !== yearTo) {
          saveToLocalStorageTransitPeriod(item, userDaysOff);
        } else {
          const periodDates = extractDatesFromPeriod(item);

          periodDates.forEach((date) => {
            if (
              userDaysOff.some((dayoff) => {
                return isTheSameDates(dayoff.date, date);
              })
            ) {
              return;
            }

            userDaysOff.push({
              date: date,
              duration: item?.quantity,
              description: item?.description,
              type: item?.type === 1 ? "sickday" : "vacation",
            });
          });
        }
      }
    });

    return userDaysOff;
  } catch (error) {
    console.log(error);
  }
};
