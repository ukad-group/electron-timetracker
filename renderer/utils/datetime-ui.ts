import {
  FormattedReport,
  DayOff,
  ApiDayOff,
} from "../components/Calendar/Calendar";

export const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

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
  monthReports: FormattedReport[],
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

export function getMonthRequiredHours(calendarDate: Date, daysOff: DayOff[]) {
  if (!daysOff) return;

  const lastDayOfMonth = new Date(
    calendarDate.getFullYear(),
    calendarDate.getMonth() + 1,
    0
  );

  let totalWorkHours = 0;

  for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
    const monthDay = new Date(
      calendarDate.getFullYear(),
      calendarDate.getMonth(),
      i
    );

    const isWeekend = monthDay.getDay() === 0 || monthDay.getDay() === 6;
    const dayOff = daysOff.find((day) => isTheSameDates(monthDay, day.date));

    if (!isWeekend && !dayOff) {
      totalWorkHours += 8;
    } else if (dayOff && dayOff?.duration !== 8) {
      totalWorkHours += 8 - dayOff.duration; // detect not a full dayOff
    }
  }

  return totalWorkHours * 3600000;
}

export function extractDatesFromPeriod(period: ApiDayOff, holidays: DayOff[]) {
  const dateStart = new Date(
    new Date(period?.dateFrom).toISOString().slice(0, -1)
  );
  const dateEnd = new Date(new Date(period?.dateTo).toISOString().slice(0, -1));
  const vacationRange = generateDateRange(dateStart, dateEnd);

  const datesWithoutWeekendsHolidays = vacationRange
    .filter((date) => {
      return (
        date.getDay() >= 1 &&
        date.getDay() <= 5 &&
        holidays.some((holiday) => !isTheSameDates(holiday.date, date))
      );
    })
    .map((date) => {
      return {
        date: date,
        duration: period?.quantity,
        description: period?.description,
        type: period?.type,
      };
    });

  return datesWithoutWeekendsHolidays;
}

function generateDateRange(startDate: Date, endDate: Date) {
  const dateRange: Date[] = [];
  let currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    dateRange.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dateRange;
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
  let dateString = date;
  let dateArray = dateString.split("");

  if (dateArray[dateArray.length - 1] === "Z") {
    dateArray.pop();
    dateString = dateArray.join("");
  }

  return new Date(dateString).toLocaleTimeString([], {
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

// export const getStringDate = (date: Date): string => {
//   const year = date.getFullYear();
//   const month = (date.getMonth() + 1).toString().padStart(2, "0");
//   const day = date.getDate().toString().padStart(2, "0");

//   return `${year}-${month}-${day}`;
// };

export const convertMillisecondsToTime = (milliseconds) => {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60)
    .toString()
    .padStart(2, "0");

  return `${hours}:${minutes}`;
};

export const getWeekDates = (inputDate: Date) => {
  const startDate = new Date(inputDate);
  startDate.setDate(
    inputDate.getDate() -
      inputDate.getDay() +
      (inputDate.getDay() === 0 ? -6 : 1)
  );

  const weekDays = [];

  for (let i = 0; i < 7; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + i);
    weekDays.push(currentDate);
  }

  return weekDays;
};

export const getMonthDates = (inputDate: Date) => {
  const firstDay = new Date(inputDate.getFullYear(), inputDate.getMonth(), 1);

  const lastDay = new Date(
    inputDate.getFullYear(),
    inputDate.getMonth() + 1,
    0
  );

  const monthDates = [];
  for (let i = firstDay.getDate(); i <= lastDay.getDate(); i++) {
    const currentDate = new Date(
      inputDate.getFullYear(),
      inputDate.getMonth(),
      i
    );
    monthDates.push(currentDate);
  }

  return monthDates;
};

export const getCurrentTimeRoundedUp = () => {
  const currentTime = new Date();
  const minutes = currentTime.getMinutes();
  const minutesToAdd = (15 - (minutes % 15)) % 15;
  currentTime.setMinutes(minutes + minutesToAdd);
  const formattedTime = currentTime.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  return `${formattedTime}`;
};
