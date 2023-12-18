import {
  extractDatesFromPeriod,
  isTheSameDates,
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
    const userEmail = timetrackerUserInfo?.email;
    const userPromises = [];
    let nextYearVacationsPromise: Promise<VacationSickDaysData> | undefined;
    let prevYearVacationsPromise: Promise<VacationSickDaysData> | undefined;

    const vacationsPromise: Promise<VacationSickDaysData> =
      global.ipcRenderer.invoke(
        "timetracker:get-vacations",
        plannerToken,
        userEmail,
        calendarDate
      );

    // if calendar is in december - get next year info
    if (calendarDate.getMonth() === 11) {
      const currentDate = new Date(calendarDate);
      const nextYear = new Date(
        currentDate.setFullYear(currentDate.getFullYear() + 1)
      );

      nextYearVacationsPromise = global.ipcRenderer.invoke(
        "timetracker:get-vacations",
        plannerToken,
        userEmail,
        nextYear
      );
    }

    // if calendar is in january - get previous year info
    if (calendarDate.getMonth() === 0) {
      const currentDate = new Date(calendarDate);
      const prevYear = new Date(
        currentDate.setFullYear(currentDate.getFullYear() - 1)
      );

      prevYearVacationsPromise = global.ipcRenderer.invoke(
        "timetracker:get-vacations",
        plannerToken,
        userEmail,
        prevYear
      );
    }

    userPromises.push(vacationsPromise);
    if (nextYearVacationsPromise) userPromises.push(nextYearVacationsPromise);
    if (prevYearVacationsPromise) userPromises.push(prevYearVacationsPromise);

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

      return await loadHolidaysAndVacations(calendarDate);
    }

    const vacationsAndSickdays: ApiDayOff[] = [];

    userFetchedData.forEach((data) =>
      data.periods.forEach((period) => vacationsAndSickdays.push(period))
    );

    const userDaysOff: DayOff[] = [];

    vacationsAndSickdays.forEach((item) => {
      const singleDayOff = isTheSameDates(
        new Date(item.dateFrom),
        new Date(item.dateTo)
      );

      if (singleDayOff) {
        userDaysOff.push({
          date: new Date(new Date(item?.dateFrom).toISOString().slice(0, -1)), // avoid timezone
          duration: item?.quantity,
          description: item?.description,
          type: item?.type,
        });
      }
    });

    vacationsAndSickdays.forEach((item) => {
      const periodDayOff = !isTheSameDates(
        new Date(item.dateFrom),
        new Date(item.dateTo)
      );

      if (periodDayOff) {
        const formattedPeriodDates = extractDatesFromPeriod(item, userDaysOff);

        formattedPeriodDates.forEach((periodDay) => {
          userDaysOff.push(periodDay);
        });
      }
    });

    return userDaysOff;
  } catch (error) {
    console.log(error);
  }
};
