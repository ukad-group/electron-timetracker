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
