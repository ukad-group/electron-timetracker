import {
  useState,
  useEffect,
  useRef,
  Dispatch,
  SetStateAction,
  useMemo,
} from "react";
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
import NavButtons from "../ui/NavButtons";
import Button from "../ui/Button";
import {
  getMonthWorkHours,
  getWeekNumber,
  isTheSameDates,
} from "../../utils/datetime-ui";

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

export type WorkHoursReport = {
  date: string;
  week: number;
  workDurationMs: number;
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
  const currentReadableMonth = months[calendarDate.getMonth()];
  const currentYear = calendarDate.getFullYear();

  const monthTotalHours = useMemo(() => {
    return formatDuration(
      getMonthWorkHours(monthWorkHoursReports, calendarDate)
    );
  }, [monthWorkHoursReports, calendarDate]);

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
  }, [calendarDate, shouldAutosave, reportsFolder]);

  // prettier-ignore
  useEffect(() => {
    const monthWorkHours = monthReportsFromServer.map((report) => {
      const { reportDate, data } = report;
      const activities: ReportActivity[] = validation((parseReport(data)[0] || []).filter(
        (activity: ReportActivity) => !activity.isBreak
      ));
      const workDurationMs = activities.reduce((acc, { duration }) => acc + (duration || 0), 0);
     
      return {
       date: reportDate,
       week: getWeekNumber(reportDate),
       workDurationMs: workDurationMs,
       isValid: activities.every((report: ReportActivity) => report.isValid === true),
      };
     });

    setMonthWorkHoursReports(monthWorkHours);
  }, [monthReportsFromServer]);

  const getCalendarApi = () => calendarRef.current.getApi();

  const prevButtonHandle = () => {
    getCalendarApi().prev();
    setCalendarDate((date) => new Date(date.setMonth(date.getMonth() - 1, 1)));
  };

  const nextButtonHandle = () => {
    getCalendarApi().next();
    setCalendarDate((date) => new Date(date.setMonth(date.getMonth() + 1, 1)));
  };

  const todayButtonHandle = () => {
    getCalendarApi().today();
    setCalendarDate(new Date());
  };

  const dateClickHandle = (info) => {
    info.date.setHours(1); // by default info.date is 00:00, sometimes it can cause a bug, considering the date as the previous day
    setSelectedDate(info.date);
  };

  const addCellClassNameHandle = (info) => {
    const isToday = isTheSameDates(info.date, selectedDate);
    if (isToday) {
      return "fc-custom-today-date";
    }
    return "";
  };

  const weekNumberContent = (options) => {
    const weekTotalHours = formatDuration(
      monthWorkHoursReports.reduce((acc, report) => {
        if (report.week === options.num) {
          acc += report.workDurationMs;
        }
        return acc;
      }, 0)
    );

    return (
      <div className="flex flex-col text-xs">
        <span>week {options.num}</span>
        <span className="self-start">{weekTotalHours}</span>
      </div>
    );
  };

  return (
    <div className="wrapper bg-white p-4 rounded-lg shadow">
      <div className="calendar-header h-10 flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold">{`${currentReadableMonth} ${currentYear}`}</h3>
          <p className="text-xs text-gray-500">Total: {monthTotalHours}</p>
        </div>
        <div className="flex gap-4">
          {calendarDate.getMonth() !== new Date().getMonth() && (
            <Button
              text="Go to current month"
              callback={todayButtonHandle}
              type={"button"}
            />
          )}
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
        weekNumbers={true}
        weekNumberContent={weekNumberContent}
        height="auto"
      />
    </div>
  );
}

function renderEventContent(eventInfo) {
  return (
    <>
      <p>
        Logged: {formatDuration(eventInfo.event.extendedProps.workDurationMs)}
      </p>
      {eventInfo.event.extendedProps.isValid === false && (
        <ExclamationCircleIcon className="w-5 h-5 absolute fill-red-500 -top-[290%] left-[60%]" />
      )}
    </>
  );
}