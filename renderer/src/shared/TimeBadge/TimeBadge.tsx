import { useState, useEffect } from "react";
import { stringToMinutes } from "@/helpers/utils/utils";
import { TimeBadgeProps } from "./types";
import { loadHolidaysAndVacations } from "@/components/Calendar/utils";

export default function TimeBadge({ hours, startTime, selectedDate }: TimeBadgeProps) {
  const curDate = new Date();
  const curTime = curDate.getHours() * 60 + curDate.getMinutes();
  const [dayOffDuration, setDayOffDuration] = useState(0);

  useEffect(() => {
    setDayOffDuration(0);
    (async () => {
      const daysOff = await loadHolidaysAndVacations(selectedDate);
      daysOff.forEach((day) => {
        if (
          day.date.getDate() === selectedDate.getDate() &&
          day.date.getMonth() === selectedDate.getMonth() &&
          day.date.getFullYear() === selectedDate.getFullYear()
        ) {
          setDayOffDuration(Number(day.duration));
        }
      });
    })();
  }, [selectedDate, hours]);

  if (
    (hours + dayOffDuration < 6 && selectedDate.toDateString() !== curDate.toDateString()) ||
    (hours + dayOffDuration < 6 && curTime - stringToMinutes(startTime) > 360)
  ) {
    return (
      <span
        data-testid="sixHoursBadge"
        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:text-red-400 dark:bg-red-400/20"
      >
        less than 6h
      </span>
    );
  }
  if (
    (hours + dayOffDuration < 8 && selectedDate.toLocaleDateString() !== curDate.toLocaleDateString()) ||
    (hours + dayOffDuration < 8 && curTime - stringToMinutes(startTime) > 480)
  ) {
    return (
      <span
        data-testid="eightHoursBadge"
        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:text-yellow-400 dark:bg-yellow-400/20"
      >
        less than 8h
      </span>
    );
  }
}
