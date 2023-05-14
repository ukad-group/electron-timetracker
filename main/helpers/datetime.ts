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
