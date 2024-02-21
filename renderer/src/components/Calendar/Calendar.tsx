import { useState, useEffect, useRef, useMemo, cloneElement, ReactElement } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { ExclamationCircleIcon } from "@heroicons/react/24/solid";
import { CalendarDaysIcon, FaceFrownIcon, GlobeAltIcon } from "@heroicons/react/24/outline";
import { formatDuration, parseReport, validation, ReportActivity } from "@/helpers/utils/reports";
import { NavButtons } from "@/shared/NavButtons";
import { Button } from "@/shared/Button";
import { ErrorPlaceholder, RenderError } from "../../shared/ErrorPlaceholder";
import {
  getMonthWorkHours,
  getRequiredHours,
  getWeekNumber,
  isTheSameDates,
  MONTHS,
  mathOvertimeUndertime,
} from "@/helpers/utils/datetime-ui";
import { loadHolidaysAndVacations } from "./utils";
import { CalendarProps, ParsedReport, FormattedReport, TTUserInfo } from "./types";
import { LOCAL_STORAGE_VARIABLES, TRACK_CONNECTIONS } from "@/helpers/contstants";
import { IPC_MAIN_CHANNELS } from "@electron/helpers/constants";
import { useTutorialProgressStore } from "@/store/tutorialProgressStore";
import { shallow } from "zustand/shallow";
import { Hint } from "@/shared/Hint";
import { SCREENS } from "@/constants";
import { HINTS_GROUP_NAMES, HINTS_ALERTS } from "@/helpers/contstants";
import { changeHintConditions } from "@/helpers/utils/utils";
import useScreenSizes from "@/helpers/hooks/useScreenSizes";
import { trackConnections } from "@/helpers/utils/utils";

export function Calendar({
  reportsFolder,
  selectedDate,
  setSelectedDate,
  calendarDate,
  setCalendarDate,
}: CalendarProps) {
  const [parsedQuarterReports, setParsedQuarterReports] = useState<ParsedReport[]>([]);
  const [formattedQuarterReports, setFormattedQuarterReports] = useState<FormattedReport[]>([]);
  const calendarRef = useRef(null);
  const allCalendarRef = useRef(null);
  const totalTimeRef = useRef(null);
  const weekNumberRef = useRef(null);
  const currentReadableMonth = MONTHS[calendarDate.getMonth()];
  const currentYear = calendarDate.getFullYear();
  const [daysOff, setDaysOff] = useState([]);
  const [renderError, setRenderError] = useState<RenderError>({
    errorTitle: "",
    errorMessage: "",
  });
  const { screenSizes } = useScreenSizes();
  const timetrackerUserInfo: TTUserInfo = JSON.parse(localStorage.getItem(LOCAL_STORAGE_VARIABLES.TIMETRACKER_USER));

  const monthWorkedHours = useMemo(() => {
    return formatDuration(getMonthWorkHours(formattedQuarterReports, calendarDate));
  }, [formattedQuarterReports, calendarDate]);

  const monthRequiredHours = useMemo(() => {
    const lastDayOfMonth = new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 0);
    return formatDuration(getRequiredHours(calendarDate, daysOff, lastDayOfMonth));
  }, [daysOff, calendarDate]);

  const workRequiredHours = useMemo(() => {
    const { overUnder, overUnderHours } = mathOvertimeUndertime(
      formattedQuarterReports,
      calendarDate,
      daysOff,
      selectedDate,
    );

    const daysRequiredHours = formatDuration(getRequiredHours(calendarDate, daysOff, selectedDate));

    if (!getRequiredHours(calendarDate, daysOff, selectedDate)) return;

    return (
      <p>
        (out of {daysRequiredHours})
        {!!overUnderHours && (
          <span
            className={
              (overUnder === "overtime" && "text-green-500/50 ml-1") ||
              (overUnder === "undertime" && "text-red-500/50 ml-1")
            }
          >
            {overUnder === "undertime" && "-"}
            {formatDuration(overUnderHours)}
          </span>
        )}
      </p>
    );
  }, [formattedQuarterReports, calendarDate, daysOff, selectedDate]);

  useEffect(() => {
    try {
      (async () => {
        setParsedQuarterReports(
          await global.ipcRenderer.invoke(IPC_MAIN_CHANNELS.APP_FIND_QUARTER_PROJECTS, reportsFolder, calendarDate),
        );
      })();

      const fileChangeListener = () => {
        (async () => {
          setParsedQuarterReports(
            await global.ipcRenderer.invoke(IPC_MAIN_CHANNELS.APP_FIND_QUARTER_PROJECTS, reportsFolder, calendarDate),
          );
        })();
      };

      global.ipcRenderer.on(IPC_MAIN_CHANNELS.ANY_FILE_CHANGED, fileChangeListener);

      return () => {
        global.ipcRenderer.removeListener(IPC_MAIN_CHANNELS.ANY_FILE_CHANGED, fileChangeListener);
      };
    } catch (err) {
      console.log("Error details ", err);
      setRenderError({
        errorTitle: "Calendar error",
        errorMessage: "An error occurred when validating reports for the last month. ",
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
          isValid: activities.every((report: ReportActivity) => report.validation.isValid ),
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
  }, [calendarDate, selectedDate]);

  useEffect(() => {
    setProgress(progress);
  }, [screenSizes]);

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

  useEffect(() => {
    if (timetrackerUserInfo) {
      trackConnections(TRACK_CONNECTIONS.TIMETRACKER_WEB);
    }
  }, []);
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

  const renderWeekNumberContent = (options) => {
    const weekTotalHours = formatDuration(
      formattedQuarterReports.reduce((acc, report) => {
        if (report.week === options.num) {
          acc += report.workDurationMs;
        }
        return acc;
      }, 0),
    );

    return (
      <div ref={weekNumberRef} className="flex flex-col text-xs text-zinc-400">
        <span>week {options.num}</span>
        <span className="self-start">{weekTotalHours}</span>
      </div>
    );
  };

  const getDayCellContent = (info) => {
    if (!daysOff || daysOff?.length === 0) {
      return info.dayNumberText;
    }

    const userDayOff = daysOff?.find((day) => isTheSameDates(info.date, day.date));

    if (userDayOff) {
      const duration = userDayOff?.duration === 8 ? "all day" : userDayOff?.duration + "h";
      let icon: ReactElement | undefined;
      let title: string | undefined;

      switch (userDayOff?.type) {
        case 2:
          icon = <GlobeAltIcon className="absolute top-[30px] right-[2px] w-5 h-5" />;
          title = userDayOff?.description ? `${userDayOff?.description}, ${duration}` : "Holiday";
          break;
        case 0:
          icon = <CalendarDaysIcon className="absolute top-[30px] right-[2px] w-5 h-5" />;
          title = `Vacation, ${duration}`;
          break;
        case 1:
          icon = <FaceFrownIcon className="absolute top-[30px] right-[2px] w-5 h-5" />;
          title = `Sickday, ${duration}`;
          break;
        default:
          return info.dayNumberText;
      }

      return (
        <div>
          {info.dayNumberText}
          {cloneElement(icon, { title })}
        </div>
      );
    } else {
      return info.dayNumberText;
    }
  };

  const [progress, setProgress] = useTutorialProgressStore((state) => [state.progress, state.setProgress], shallow);

  useEffect(() => {
    changeHintConditions(progress, setProgress, [
      {
        groupName: HINTS_GROUP_NAMES.CALENDAR,
        newConditions: [false],
        existingConditions: [false],
      },
    ]);

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = document.documentElement;

      if (scrollTop + clientHeight + 50 >= scrollHeight) {
        changeHintConditions(progress, setProgress, [
          {
            groupName: HINTS_GROUP_NAMES.CALENDAR,
            newConditions: [true],
            existingConditions: [true],
          },
        ]);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  if (renderError.errorMessage && renderError.errorTitle) {
    return <ErrorPlaceholder {...renderError} />;
  }

  return (
    <div
      ref={allCalendarRef}
      className="wrapper bg-white p-4 rounded-lg shadow dark:bg-dark-container dark:border dark:border-dark-border"
    >
      <div className="calendar-header h-10 flex items-center justify-between mb-4">
        <div ref={totalTimeRef}>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-heading">{`${currentReadableMonth} ${currentYear}`}</h3>
          <div className="flex gap-1 text-xs text-gray-500 dark:text-dark-main">
            Total: {monthWorkedHours} {workRequiredHours}
          </div>
          {timetrackerUserInfo && (
            <p className="text-xs text-gray-500 dark:text-dark-main">Required: {monthRequiredHours}</p>
          )}
        </div>
        <div className="flex gap-4">
          {calendarDate.getMonth() !== new Date().getMonth() && (
            <Button text="Go to current month" callback={todayButtonHandle} type={"button"} />
          )}
          <NavButtons prevCallback={prevButtonHandle} nextCallback={nextButtonHandle} />
        </div>
        {screenSizes.screenWidth >= SCREENS.LG && (
          <Hint
            displayCondition
            learningMethod="nextClick"
            order={1}
            groupName={HINTS_GROUP_NAMES.CALENDAR}
            referenceRef={allCalendarRef}
            shiftY={150}
            shiftX={50}
            width={"medium"}
            position={{
              basePosition: "right",
              diagonalPosition: "top",
            }}
          >
            {HINTS_ALERTS.CALENDAR}
          </Hint>
        )}
        {screenSizes.screenWidth < SCREENS.LG && (
          <Hint
            displayCondition
            learningMethod="nextClick"
            order={1}
            groupName={HINTS_GROUP_NAMES.CALENDAR}
            referenceRef={allCalendarRef}
            shiftY={50}
            shiftX={0}
            width={"medium"}
            position={{
              basePosition: "top",
              diagonalPosition: "right",
            }}
          >
            {HINTS_ALERTS.CALENDAR}
          </Hint>
        )}
        <Hint
          learningMethod="nextClick"
          order={2}
          groupName={HINTS_GROUP_NAMES.CALENDAR}
          referenceRef={totalTimeRef}
          shiftY={200}
          shiftX={50}
          width={"medium"}
          position={{
            basePosition: "right",
            diagonalPosition: "bottom",
          }}
        >
          {HINTS_ALERTS.CALENDAR_TOTALS}
        </Hint>
        <Hint
          learningMethod="nextClick"
          order={3}
          groupName={HINTS_GROUP_NAMES.CALENDAR}
          referenceRef={weekNumberRef}
          shiftY={200}
          shiftX={50}
          width={"medium"}
          position={{
            basePosition: "right",
            diagonalPosition: "top",
          }}
        >
          {HINTS_ALERTS.CALENDAR_WEEKS}
        </Hint>
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
        weekNumberContent={renderWeekNumberContent}
        height="auto"
        dayCellContent={getDayCellContent}
      />
    </div>
  );
}

function renderEventContent(eventInfo) {
  return (
    <>
      {eventInfo.event.extendedProps.isValid === false && (
        <ExclamationCircleIcon className="w-5 h-5 absolute fill-red-500 -top-[25px] -left-[1px] dark:fill-red-500/70" />
      )}
      {eventInfo.event.extendedProps.workDurationMs ? (
        <p className="whitespace-normal">Logged: {formatDuration(eventInfo.event.extendedProps.workDurationMs)}</p>
      ) : (
        <p className="whitespace-normal">File is empty</p>
      )}
    </>
  );
}
