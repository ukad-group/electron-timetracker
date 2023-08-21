import { useState, useEffect, useRef, Dispatch, SetStateAction } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { ipcRenderer } from "electron";
import { ExclamationCircleIcon } from "@heroicons/react/24/solid";

import {
  formatDuration,
  parseReport,
  validation,
  ReportActivity,
} from "../../utils/reports";
import NavButtons from "../NavButtons";
import Button from "../Button";

const months = [
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
];

type CalendarProps = {
  reportsFolder: string;
  selectedDate: Date;
  setSelectedDate: Dispatch<SetStateAction<Date>>;
  shouldAutosave: boolean;
};

type ReportFromServer = {
  data: string;
  reportDate: string;
};

type WorkHoursReport = {
  date: string;
  workDurationHours: string;
  isValid: boolean;
};

export function Calendar({
  reportsFolder,
  selectedDate,
  setSelectedDate,
  shouldAutosave,
}: CalendarProps) {
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [monthReportsFromServer, setMonthReportsFromServer] = useState<
    ReportFromServer[]
  >([]);
  const [monthWorkHoursReports, setMonthWorkHoursReports] = useState<
    WorkHoursReport[]
  >([]);
  const calendarRef = useRef(null);
  const currentMonth = months[calendarDate.getMonth()];
  const currentYear = calendarDate.getFullYear();

  useEffect(() => {
    (async () => {
      setMonthReportsFromServer(
        await ipcRenderer.invoke(
          "app:find-month-projects",
          reportsFolder,
          calendarDate
        )
      );
    })();
  }, [calendarDate, shouldAutosave]);

  useEffect(() => {
    const monthWorkHours = monthReportsFromServer.map((report) => {
      const { reportDate, data } = report;
      const activities: ReportActivity[] = validation((parseReport(data)[0] || []).filter(
        (activity: ReportActivity) => !activity.isBreak
      ));
      const workDurationMs = activities.reduce((acc, { duration }) => acc + (duration || 0), 0);
     
      return {
       date: reportDate,
       workDurationHours: formatDuration(workDurationMs),
       isValid: activities.every((report: ReportActivity) => report.isValid === true),
      };
     });

    setMonthWorkHoursReports(monthWorkHours);
  }, [monthReportsFromServer]);

  const prevButtonHandle = () => {
    const calendarApi = calendarRef.current.getApi();
    calendarApi.prev();
    setCalendarDate((date) => new Date(date.setMonth(date.getMonth() - 1)));
  };

  const nextButtonHandle = () => {
    const calendarApi = calendarRef.current.getApi();
    calendarApi.next();
    setCalendarDate((date) => new Date(date.setMonth(date.getMonth() + 1)));
  };

  const todayButtonHandle = () => {
    const calendarApi = calendarRef.current.getApi();
    calendarApi.today();
    setCalendarDate(new Date());
  };

  const dateClickHandle = (info) => {
    setSelectedDate(info.date);
  };

  const addCellClassNameHandle = (info) => {
    if (info.date.setHours(0, 0, 0, 0) === selectedDate.setHours(0, 0, 0, 0)) {
      return "fc-custom-today-date";
    }
    return "";
  };

  return (
    <div className="wrapper bg-white p-4 rounded-lg shadow">
      <div className="calendar-header h-10 flex items-center justify-between mb-4">
        <p className="text-lg font-semibold">{`${currentMonth} ${currentYear}`}</p>
        <div className="flex gap-4">
          <Button
            callback={todayButtonHandle}
            text="Go to current month"
            disabled={
              calendarDate.getMonth() === new Date().getMonth() ? true : false
            }
          />
          <NavButtons
            prevCallback={prevButtonHandle}
            nextCallback={nextButtonHandle}
          />
        </div>
      </div>
      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, interactionPlugin]}
        headerToolbar={false}
        initialView="dayGridMonth"
        firstDay={1}
        events={monthWorkHoursReports}
        eventContent={renderEventContent}
        dateClick={dateClickHandle}
        dayCellClassNames={addCellClassNameHandle}
      />
    </div>
  );
}

function renderEventContent(eventInfo) {
  return (
    <>
      <p>Logged: {eventInfo.event.extendedProps.workDurationHours}</p>
      {eventInfo.event.extendedProps.isValid === false && (
        <ExclamationCircleIcon className="w-5 h-5 absolute fill-red-500 -top-7 left-0" />
      )}
    </>
  );
}
