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
