import React from "react";
import { stringToMinutes } from "@/helpers/utils/reports";
import { TimeBadgeProps } from "./types";

const TimeBadge = ({ hours, startTime, selectedDate }: TimeBadgeProps) => {
  const curDate = new Date();
  const curTime = curDate.getHours() * 60 + curDate.getMinutes();

  if (
    (hours < 6 && selectedDate.toDateString() !== curDate.toDateString()) ||
    (hours < 6 && curTime - stringToMinutes(startTime) > 360)
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
    (hours < 8 && selectedDate.toLocaleDateString() !== curDate.toLocaleDateString()) ||
    (hours < 8 && curTime - stringToMinutes(startTime) > 480)
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
};

export default TimeBadge;
