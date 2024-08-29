import { extractDatesFromPeriod, getWeekNumber, isTheSameDates } from "@/helpers/utils/datetime-ui";
import { DayOff, ApiDayOff, TTUserInfo, ParsedReport, VacationSickDaysData } from "./types";
import { IPC_MAIN_CHANNELS } from "@electron/helpers/constants";
import { LOCAL_STORAGE_VARIABLES } from "@/helpers/constants";
import { ReportActivity, parseReport, validation } from "@/helpers/utils/reports";

export const loadHolidaysAndVacations = async (calendarDate: Date) => {
  try {
    const timetrackerUserInfo: TTUserInfo = await JSON.parse(
      localStorage.getItem(LOCAL_STORAGE_VARIABLES.TIMETRACKER_USER),
    );

    if (!timetrackerUserInfo) return;

    const plannerToken = timetrackerUserInfo?.plannerAccessToken;
    const userEmail = timetrackerUserInfo?.email;
    const userPromises = [];
    let nextYearVacationsPromise: Promise<VacationSickDaysData> | undefined;
    let prevYearVacationsPromise: Promise<VacationSickDaysData> | undefined;

    const vacationsPromise: Promise<VacationSickDaysData> = global.ipcRenderer.invoke(
      IPC_MAIN_CHANNELS.TIMETRACKER_GET_VACATIONS,
      plannerToken,
      userEmail,
      calendarDate,
    );

    // if calendar is in december - get next year info
    if (calendarDate.getMonth() === 11) {
      const currentDate = new Date(calendarDate);
      const nextYear = new Date(currentDate.setFullYear(currentDate.getFullYear() + 1));

      nextYearVacationsPromise = global.ipcRenderer.invoke(
        IPC_MAIN_CHANNELS.TIMETRACKER_GET_VACATIONS,
        plannerToken,
        userEmail,
        nextYear,
      );
    }

    // if calendar is in january - get previous year info
    if (calendarDate.getMonth() === 0) {
      const currentDate = new Date(calendarDate);
      const prevYear = new Date(currentDate.setFullYear(currentDate.getFullYear() - 1));

      prevYearVacationsPromise = global.ipcRenderer.invoke(
        IPC_MAIN_CHANNELS.TIMETRACKER_GET_VACATIONS,
        plannerToken,
        userEmail,
        prevYear,
      );
    }

    userPromises.push(vacationsPromise);

    if (nextYearVacationsPromise) userPromises.push(nextYearVacationsPromise);
    if (prevYearVacationsPromise) userPromises.push(prevYearVacationsPromise);

    const userFetchedData = await Promise.all(userPromises);

    if (userFetchedData.includes("invalid_token")) {
      const refreshToken = timetrackerUserInfo?.plannerRefreshToken;
      // console.log("REFREESH CALENDAR");
      // console.log("timetrackerUserInfo", timetrackerUserInfo);

      const refreshedPlannerCreds = await global.ipcRenderer.invoke(
        IPC_MAIN_CHANNELS.TIMETRACKER_REFRESH_PLANNER_TOKEN,
        refreshToken,
      );

      const refreshedUserInfo = {
        ...timetrackerUserInfo,
        plannerAccessToken: refreshedPlannerCreds?.access_token,
      };

      localStorage.setItem(LOCAL_STORAGE_VARIABLES.TIMETRACKER_USER, JSON.stringify(refreshedUserInfo));

      return await loadHolidaysAndVacations(calendarDate);
    }

    const vacationsAndSickdays: ApiDayOff[] = [];

    userFetchedData.forEach((data) => data.periods.forEach((period: ApiDayOff) => vacationsAndSickdays.push(period)));

    const userDaysOff: DayOff[] = [];

    vacationsAndSickdays.forEach((item) => {
      const singleDayOff = isTheSameDates(new Date(item.dateFrom), new Date(item.dateTo));

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
      const periodDayOff = !isTheSameDates(new Date(item.dateFrom), new Date(item.dateTo));

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

export const getFormattedReports = (reports: ParsedReport[]) => {
  return reports.map((report) => {
    const { reportDate, data } = report;
    const activities: ReportActivity[] = validation(
      (parseReport(data)[0] || []).filter((activity: ReportActivity) => !activity.isBreak),
    );
    const workDurationMs = activities.reduce((acc, { duration }) => acc + (duration || 0), 0);

    return {
      date: reportDate,
      week: getWeekNumber(reportDate, true),
      workDurationMs: workDurationMs,
      isValid: activities.every((report: ReportActivity) => report.validation.isValid),
    };
  });
};
