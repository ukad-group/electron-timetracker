import { Dispatch, SetStateAction } from "react";
import { BookingFromApi } from "@/components/Bookings/types";

export type CalendarProps = {
  reportsFolder: string;
  calendarDate: Date;
  setCalendarDate: Dispatch<SetStateAction<Date>>;
  selectedDate: Date;
  setSelectedDate: Dispatch<SetStateAction<Date>>;
};

export type ParsedReport = {
  data: string;
  reportDate: string;
};

export type FormattedReport = {
  date: string;
  week: number;
  workDurationMs: number;
  isValid: boolean;
};

export type DayOff = {
  date: Date;
  duration: number;
  description: string;
  type: number;
};

export type ApiDayOff = {
  dateFrom: string;
  dateTo: string;
  quantity: number;
  description: string;
  type: number;
};

export type TTUserInfo = {
  userInfoIdToken: string;
  userInfoRefreshToken: string;
  name: string;
  email: string;
  TTCookie: string;
  holidays: ApiDayOff[];
  vacationsSickdays: ApiDayOff[];
  yearProjects: string[];
  plannerAccessToken: string;
  plannerRefreshToken: string;
  monthBookings: BookingFromApi[];
};
