import React from "react";
import { stringToMinutes } from "../../utils/reports";

export type TimeBadgeProps = {
  hours: number;
  startTime: string;
  selectedDate: Date;
};

export default function TimeBadge({
  hours,
  startTime,
  selectedDate,
}: TimeBadgeProps) {
  const curDate = new Date();
  const curTime = curDate.getHours() * 60 + curDate.getMinutes();

  if (
    (hours < 6 &&
      selectedDate.toLocaleDateString() !== curDate.toLocaleDateString()) ||
    (hours < 6 && curTime - stringToMinutes(startTime) > 360)
  ) {
    return (
      <span
        data-testid="less6"
        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"
      >
        less than 6h
      </span>
    );
  } else if (hours < 8) {
    return (
      <span
        data-testid="less8"
        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"
      >
        less than 8h
      </span>
    );
  }
}
