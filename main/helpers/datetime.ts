export function getISOWeek(date: Date): number {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const daysOffset =
    firstDayOfYear.getDay() === 0 ? -6 : 1 - firstDayOfYear.getDay();

  const yearStart = new Date(date.getFullYear(), 0, 1 + daysOffset);
  const diff = date.getTime() - yearStart.getTime();
  const weekNumber = Math.floor(diff / (7 * 24 * 60 * 60 * 1000));

  return weekNumber;
}

export function formatTimereportDate(date: Date): string {
  const year = date.getFullYear().toString();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");

  return `${year}${month}${day}`;
}

export function getPathFromDate(date: Date, reportsFolder: string): string {
  const year = date.getFullYear();
  const week = getISOWeek(date).toString().padStart(2, "0");
  const timereportDate = formatTimereportDate(date);

  return `${reportsFolder}/${year}/week ${week}/timereport - ${timereportDate}`;
}

export function calcDurationBetweenTimes(from: string, to: string): number {
  if (from == undefined || to == undefined) {
    return null;
  }
  const startParts = from.split(":");
  const endParts = to.split(":");

  const startHours = parseInt(startParts[0], 10) || 0;
  const startMinutes = parseInt(startParts[1], 10) || 0;

  const endHours = parseInt(endParts[0], 10) || 0;
  const endMinutes = parseInt(endParts[1], 10) || 0;

  const startTotalMinutes = startHours * 60 + startMinutes;
  const endTotalMinutes = endHours * 60 + endMinutes;

  const totalMinutes = endTotalMinutes - startTotalMinutes;

  const hours = Math.round((totalMinutes / 60) * 100) / 100;

  return hours;
}
