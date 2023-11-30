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
import { ExclamationCircleIcon } from "@heroicons/react/24/solid";
import {
  CalendarDaysIcon,
  FaceFrownIcon,
  GlobeAltIcon,
} from "@heroicons/react/24/outline";
import {
  formatDuration,
  parseReport,
  validation,
  ReportActivity,
} from "../../utils/reports";
import NavButtons from "../ui/NavButtons";
import Button from "../ui/Button";
import { ErrorPlaceholder, RenderError } from "../ui/ErrorPlaceholder";
import {
  getMonthWorkHours,
  getMonthRequiredHours,
  getStringDate,
  getWeekNumber,
  isTheSameDates,
} from "../../utils/datetime-ui";
import { loadHolidaysAndVacations } from "./calendar-utils";

const MONTHS = [
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
] as const;

type CalendarProps = {
  reportsFolder: string;
  selectedDate: Date;
  setSelectedDate: Dispatch<SetStateAction<Date>>;
};

type ParsedReport = {
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
  type: string;
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
};

export function Calendar({
  reportsFolder,
  selectedDate,
  setSelectedDate,
}: CalendarProps) {
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [parsedQuarterReports, setParsedQuarterReports] = useState<
    ParsedReport[]
  >([]);
  const [formattedQuarterReports, setFormattedQuarterReports] = useState<
    FormattedReport[]
  >([]);
  const calendarRef = useRef(null);
  const currentReadableMonth = MONTHS[calendarDate.getMonth()];
  const currentYear = calendarDate.getFullYear();
  const [daysOff, setDaysOff] = useState([]);
  const [renderError, setRenderError] = useState<RenderError>({
    errorTitle: "",
    errorMessage: "",
  });
  const timetrackerUserInfo: TTUserInfo = JSON.parse(
    localStorage.getItem("timetracker-user")
  );

  const monthWorkedHours = useMemo(() => {
    return formatDuration(
      getMonthWorkHours(formattedQuarterReports, calendarDate)
    );
  }, [formattedQuarterReports, calendarDate]);

  const monthRequiredHours = useMemo(() => {
    return formatDuration(getMonthRequiredHours(calendarDate, daysOff));
  }, [daysOff, calendarDate]);

  useEffect(() => {
    try {
      (async () => {
        setParsedQuarterReports(
          await global.ipcRenderer.invoke(
            "app:find-quarter-projects",
            reportsFolder,
            getStringDate(calendarDate)
          )
        );
      })();
      global.ipcRenderer.send("start-folder-watcher", reportsFolder);
      global.ipcRenderer.on("any-file-changed", (event, data) => {
        (async () => {
          setParsedQuarterReports(
            await global.ipcRenderer.invoke(
              "app:find-quarter-projects",
              reportsFolder,
              getStringDate(calendarDate)
            )
          );
        })();
      });

      return () => {
        global.ipcRenderer.removeAllListeners("any-file-changed");
        global.ipcRenderer.send("stop-path-watcher", reportsFolder);
      };
    } catch (err) {
      console.log("Error details ", err);
      setRenderError({
        errorTitle: "Calendar error",
        errorMessage:
          "An error occurred when validating reports for the last month. ",
      });
    }
  }, [calendarDate, reportsFolder]);

  // prettier-ignore
  useEffect(() => { 
    try{
      const fromattedReports = parsedQuarterReports.map((report) => {
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

      setFormattedQuarterReports(fromattedReports);
    } catch (err) {
      console.log("Error details ", err)
      setRenderError({errorTitle:"Calendar error", errorMessage:"An error occurred when validating reports for the last month. "})
    }
  }, [parsedQuarterReports]);

  useEffect(() => {
    (async () => {
      setDaysOff(await loadHolidaysAndVacations(calendarDate));
    })();

    global.ipcRenderer.on("window-focused", () => {
      (async () => {
        setDaysOff(await loadHolidaysAndVacations(calendarDate));
      })();
    });

    return () => {
      global.ipcRenderer.removeAllListeners("window-focused");
    };
  }, [calendarDate]);

  const getCalendarApi = () => calendarRef.current.getApi();

  useEffect(() => {
    if (
      selectedDate.getFullYear() === calendarDate.getFullYear() &&
      selectedDate.getMonth() === calendarDate.getMonth()
    )
      return;

    queueMicrotask(() => {
      const reportDate = new Date(selectedDate);
      getCalendarApi().gotoDate(reportDate);
      setCalendarDate(reportDate);
    });
  }, [selectedDate]);

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
      formattedQuarterReports.reduce((acc, report) => {
        if (report.week === options.num) {
          acc += report.workDurationMs;
        }
        return acc;
      }, 0)
    );

    return (
      <div className="flex flex-col text-xs text-zinc-400">
        <span>week {options.num}</span>
        <span className="self-start">{weekTotalHours}</span>
      </div>
    );
  };

  const handleDayCellContent = (info) => {
    if (!daysOff || daysOff?.length === 0) {
      return info.dayNumberText;
    }

    const userDayOff = daysOff?.find((day) =>
      isTheSameDates(info.date, day.date)
    );

    if (userDayOff) {
      const duration =
        userDayOff?.duration === 8 ? "all day" : userDayOff?.duration + "h";

      if (userDayOff?.type === "holiday") {
        const desciprion = userDayOff?.description
          ? userDayOff?.description
          : "Holiday";
        return (
          <div>
            {info.dayNumberText}
            <GlobeAltIcon
              className="absolute top-[30px] right-[2px] w-5 h-5"
              title={`${desciprion}, ${duration}`}
            />
          </div>
        );
      } else if (userDayOff?.type === "vacation") {
        return (
          <div>
            {info.dayNumberText}
            <CalendarDaysIcon
              className="absolute top-[30px] right-[2px] w-5 h-5"
              title={`Vacation, ${duration}`}
            />
          </div>
        );
      } else if (userDayOff?.type === "sickday") {
        return (
          <div>
            {info.dayNumberText}
            <FaceFrownIcon
              className="absolute top-[30px] right-[2px] w-5 h-5"
              title={`Sickday, ${duration}`}
            />
          </div>
        );
      }
    } else {
      return info.dayNumberText;
    }

    const transitPeriod = JSON.parse(localStorage.getItem("transit-vacation"));

    if (transitPeriod && transitPeriod?.length > 0) {
      const transitDayOff = transitPeriod?.find((transitDay) => {
        return isTheSameDates(info.date, transitDay.date);
      });

      if (transitDayOff) {
        const duration =
          transitDayOff?.duration === 8
            ? "all day"
            : transitDayOff?.duration + "h";

        if (transitDayOff?.type === "vacation") {
          return (
            <div>
              {info.dayNumberText}
              <CalendarDaysIcon
                className="absolute top-[30px] right-[2px] w-5 h-5"
                title={`Vacation, ${duration}`}
              />
            </div>
          );
        } else if (transitDayOff?.type === "sickday") {
          return (
            <div>
              {info.dayNumberText}
              <FaceFrownIcon
                className="absolute top-[30px] right-[2px] w-5 h-5"
                title={`Sickday, ${duration}`}
              />
            </div>
          );
        }
      }
    }
  };

  if (renderError.errorMessage && renderError.errorTitle) {
    return <ErrorPlaceholder {...renderError} />;
  }

  return (
    <div className="wrapper bg-white p-4 rounded-lg shadow dark:bg-dark-container dark:border dark:border-dark-border">
      <div className="calendar-header h-10 flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-heading">{`${currentReadableMonth} ${currentYear}`}</h3>
          <p className="text-xs text-gray-500 dark:text-dark-main">
            Total: {monthWorkedHours}
          </p>
          {timetrackerUserInfo && (
            <p className="text-xs text-gray-500 dark:text-dark-main">
              Required: {monthRequiredHours}
            </p>
          )}
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
        events={formattedQuarterReports}
        eventContent={renderEventContent}
        dateClick={dateClickHandle}
        dayCellClassNames={addCellClassNameHandle}
        weekNumbers={true}
        weekNumberContent={weekNumberContent}
        height="auto"
        dayCellContent={handleDayCellContent}
      />
    </div>
  );
}

function renderEventContent(eventInfo) {
  return (
    <>
      {eventInfo.event.extendedProps.isValid === false && (
        <ExclamationCircleIcon className="w-5 h-5 absolute fill-red-500 bottom-[290%] dark:fill-red-500/70" />
      )}
      {eventInfo.event.extendedProps.workDurationMs ? (
        <p>
          Logged: {formatDuration(eventInfo.event.extendedProps.workDurationMs)}
        </p>
      ) : (
        <p>File is empty</p>
      )}
    </>
  );
}
