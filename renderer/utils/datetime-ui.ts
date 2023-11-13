import { WorkHoursReport } from "../components/Calendar/Calendar";

export function checkIsToday(date: Date): boolean {
  const now = new Date();
  const chosenDate = new Date(date);

  if (now.setHours(0, 0, 0, 0) === chosenDate.setHours(0, 0, 0, 0)) {
    return true;
  } else {
    return false;
  }
}

export function isTheSameDates(date1: Date, date2: Date): boolean {
  const firstDate = new Date(date1);
  const socondDate = new Date(date2);

  if (firstDate.setHours(0, 0, 0, 0) === socondDate.setHours(0, 0, 0, 0)) {
    return true;
  } else {
    return false;
  }
}

export function getWeekNumber(dateString: string) {
  const dateObj = getDateFromString(dateString);
  const startOfYear = new Date(dateObj.getFullYear(), 0, 1);
  const days = Math.floor(
    (dateObj.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000)
  );

  return Math.ceil((days + startOfYear.getDay() + 1) / 7);
}

export function getDateFromString(dateString: string) {
  const year = parseInt(dateString.slice(0, 4), 10);
  const month = parseInt(dateString.slice(4, 6), 10) - 1;
  const day = parseInt(dateString.slice(6, 8), 10);

  return new Date(year, month, day);
}

export function getMonthWorkHours(
  monthReports: WorkHoursReport[],
  calendarDate: Date
) {
  const currentYear = calendarDate.getFullYear();
  const currentMonth = (calendarDate.getMonth() + 1)
    .toString()
    .padStart(2, "0");

  const query = currentYear + currentMonth;

  return monthReports.reduce((acc, report) => {
    if (report.date.includes(query)) acc += report.workDurationMs;
    return acc;
  }, 0);
}

export function getCeiledTime() {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();

  const ceilHours = Math.ceil(minutes / 15 > 3 ? hours + 1 : hours)
    .toString()
    .padStart(2, "0");

  const ceilMinutes = (Math.ceil(minutes / 15 > 3 ? 0 : minutes / 15) * 15)
    .toString()
    .padStart(2, "0");

  return `${ceilHours}:${ceilMinutes}`;
}

export const getTimeFromEventObj = (date: string) => {
  return new Date(date).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};

export const padStringToMinutes = (timeString: string) => {
  if (!timeString) return;

  const [hours, minutes] = timeString.split(":").map(Number);
  return hours * 60 + minutes;
};

export const getStringDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");

  return `${year}-${month}-${day}`;
};
