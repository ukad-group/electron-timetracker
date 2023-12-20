import {
  ChevronRightIcon,
  DocumentIcon,
  DocumentPlusIcon,
} from "@heroicons/react/24/outline";
import React, { useState, useEffect } from "react";
import Tooltip from "./ui/Tooltip/Tooltip";
import clsx from "clsx";
import { ReportActivity, formatDuration, parseReport } from "../utils/reports";
import {
  convertMillisecondsToTime,
  getMonthDates,
  getWeekDates,
} from "../utils/datetime-ui";
import { useMainStore } from "../store/mainStore";
import { shallow } from "zustand/shallow";

interface Description {
  id: string;
  name: string;
  duration: number;
}

interface Activity extends Description {
  descriptions: Description[];
}

interface Total extends Activity {
  activities: Activity[];
}

type PeriodName = "day" | "week" | "month";

const TOTAL_PERIODS = [
  { id: 0, name: "day" },
  { id: 1, name: "week" },
  { id: 2, name: "month" },
];

const Totals = ({ selectedDate }) => {
  const [reportsFolder] = useMainStore(
    (state) => [state.reportsFolder, state.setReportsFolder],
    shallow
  );
  const [totals, setTotals] = useState<Total[]>([]);
  const [period, setPeriod] = useState<PeriodName>("day");
  const [showedProjects, setShowedProjects] = useState<string[]>([]);
  const isShowedActivitiesList = (projectName: string) => {
    return showedProjects.includes(projectName);
  };

  useEffect(() => {
    setPeriod("day");
  }, [selectedDate]);

  useEffect(() => {
    getTotals();

    const fileChangeListener = (event) => {
      getTotals();
    };

    global.ipcRenderer.on("any-file-changed", fileChangeListener);

    return () => {
      global.ipcRenderer.removeListener("any-file-changed", fileChangeListener);
    };
  }, [selectedDate, period]);

  const getTotals = async () => {
    const dates = getDates();

    const parsedActivities = await Promise.all(
      dates.map((date) => getParsedActivities(date))
    );

    const combinedActivities = parsedActivities.reduce((acc, act) => {
      if (act) {
        return [...acc, ...act];
      }

      return acc;
    }, []);

    const initialProjectTotals = getProjectTotals(combinedActivities);
    const sortedProjectTotals = sortTotals(initialProjectTotals);
    const fullProjectTotals = sortedProjectTotals.map((total: Total) => {
      const projectActivities = getActivityTotals(
        total.name,
        combinedActivities
      );
      const sortedProjectActivities = sortTotals(projectActivities);

      return { ...total, activities: sortedProjectActivities };
    });

    setTotals(fullProjectTotals);
  };

  const getDates = () => {
    switch (period) {
      case "week":
        return getWeekDates(selectedDate);

      case "month":
        return getMonthDates(selectedDate);

      case "day":
      default:
        return [selectedDate];
    }
  };

  const getParsedActivities = async (day: Date) => {
    const dayReport = await global.ipcRenderer.invoke(
      "app:read-day-report",
      reportsFolder,
      day
    );

    const parsedReportsAndNotes = parseReport(dayReport);
    const parsedActivities = parsedReportsAndNotes[0];

    return parsedActivities;
  };

  const getProjectTotals = (activities: ReportActivity[]) => {
    const totals = activities.reduce((acc: Total[], curr: ReportActivity) => {
      if (!curr?.project || curr?.project.startsWith("!")) return acc;

      const existingTotal = acc.find((item) => item.name === curr.project);
      const name = curr.activity
        ? `${curr.activity} - ${curr.description}`
        : curr.description;

      if (!existingTotal) {
        acc.push({
          id: curr.project,
          name: curr.project,
          duration: curr.duration,
          descriptions: [
            {
              id: name,
              name: name,
              duration: curr.duration,
            },
          ],
          activities: [],
        });
      } else {
        existingTotal.duration += curr.duration;

        const existingDescription = existingTotal.descriptions.find(
          (desc) => desc.name === name
        );

        if (existingDescription) {
          existingDescription.duration += curr.duration;
        } else {
          existingTotal.descriptions.push({
            id: name,
            name: name,
            duration: curr.duration,
          });
        }
      }

      return acc;
    }, []);

    return totals;
  };

  const getActivityTotals = (
    projectName: string,
    activities: ReportActivity[]
  ) => {
    const filteredActivities = activities.filter(
      (activity: ReportActivity) => activity.project === projectName
    );

    const totals = filteredActivities.reduce(
      (acc: Activity[], curr: ReportActivity) => {
        const existingTotal = acc.find((item) => item.name === curr.activity);

        if (!existingTotal) {
          acc.push({
            id: curr.activity,
            name: curr.activity,
            duration: curr.duration,
            descriptions: [
              {
                id: curr.description,
                name: curr.description,
                duration: curr.duration,
              },
            ],
          });
        } else {
          existingTotal.duration += curr.duration;

          const existingDescription = existingTotal.descriptions.find(
            (desc) => desc.name === curr.description
          );

          if (existingDescription) {
            existingDescription.duration += curr.duration;
          } else {
            existingTotal.descriptions.push({
              id: curr.description,
              name: curr.description,
              duration: curr.duration,
            });
          }
        }

        return acc;
      },
      []
    );

    return totals;
  };

  const sortTotals = (totals) => {
    return totals.sort((totalA, totalB) =>
      totalA.name.localeCompare(totalB.name)
    );
  };

  const toggleActivitiesList = (projectName: string) => {
    if (isShowedActivitiesList(projectName)) {
      const filteredShowedProjects = showedProjects.filter(
        (project) => project !== projectName
      );

      setShowedProjects(filteredShowedProjects);
    } else {
      setShowedProjects([...showedProjects, projectName]);
    }
  };

  const copyDescriptionsHandler = (
    descriptions: Description[],
    withTime: boolean
  ) => {
    const formattedDescriptions = descriptions.reduce(
      (acc: string[], curr: Description) => {
        const name = curr.name ? curr.name : "";
        const duration = convertMillisecondsToTime(curr.duration);
        let textForCopying = "";

        switch (true) {
          case name.length > 0 && withTime:
            textForCopying = `${name} (${duration})`;
            break;

          case !name.length && withTime:
            textForCopying = `(${duration})`;
            break;

          case name.length > 0 && !withTime:
            textForCopying = name;
            break;

          default:
            break;
        }

        textForCopying.length > 0 && acc.push(textForCopying);

        return acc;
      },
      []
    );

    const descriptionsString = formattedDescriptions.join(", ");

    if (navigator.clipboard) {
      navigator.clipboard
        .writeText(descriptionsString)
        .then(() => {})
        .catch((err) => {
          console.error("Unable to copy text to clipboard", err);
        });
    }
  };

  const onChangeRange = (rangeName: PeriodName) => {
    setShowedProjects([]);
    setPeriod(rangeName);
  };

  return (
    <section className="px-4 py-5 bg-white shadow sm:rounded-lg sm:px-6 dark:bg-dark-container dark:border dark:border-dark-border">
      <h2 className="flex gap-1 items-center text-lg font-medium text-gray-900 dark:text-dark-heading">
        <div>
          <label htmlFor="select">Totals</label>
          <select
            className="cursor-pointer rounded-lg dark:text-dark-heading px-1 capitalize bg-white dark:bg-dark-container focus:outline-none"
            id="select"
            value={period}
            onChange={(e) => onChangeRange(e.target.value as PeriodName)}
          >
            {TOTAL_PERIODS.map((range) => (
              <option key={range.id} value={range.name}>
                {range.name}
              </option>
            ))}
          </select>
        </div>
      </h2>

      {totals.length > 0 && (
        <div className="flex flex-col gap-2 pt-2">
          {totals.map(({ id, name, duration, activities, descriptions }) => {
            const showActivity =
              activities.length > 1 ||
              (activities.length === 1 && activities[0].name.length > 0);

            return (
              <div key={id} className="flex flex-col gap-1">
                <div className="flex items-center gap-2 text-sm text-gray-700 font-semibold dark:text-dark-main">
                  <div
                    className={clsx(
                      "flex items-center gap-1",
                      {
                        "ml-5": !showActivity,
                      },
                      {
                        "hover:text-gray-400 dark:hover:text-white ml-0 cursor-pointer":
                          showActivity,
                      }
                    )}
                    onClick={() => {
                      toggleActivitiesList(name);
                    }}
                  >
                    {showActivity && (
                      <ChevronRightIcon
                        className={clsx("w-4 h-4", {
                          "rotate-90": isShowedActivitiesList(name),
                        })}
                      />
                    )}
                    <span>
                      {name} - {formatDuration(duration)}
                    </span>
                  </div>
                  {period === "day" && (
                    <>
                      <Tooltip>
                        <button
                          className="group"
                          title="Copy project descriptions without time"
                          onClick={() =>
                            copyDescriptionsHandler(descriptions, false)
                          }
                        >
                          <DocumentIcon className="w-[18px] h-[18px] text-gray-600 group-hover:text-gray-900 group-hover:dark:text-dark-heading" />
                        </button>
                      </Tooltip>
                      <Tooltip>
                        <button
                          className="group"
                          title="Copy project descriptions with time"
                          onClick={() =>
                            copyDescriptionsHandler(descriptions, true)
                          }
                        >
                          <DocumentPlusIcon className="w-[18px] h-[18px] text-gray-600 group-hover:text-gray-900 group-hover:dark:text-dark-heading" />
                        </button>
                      </Tooltip>
                    </>
                  )}
                </div>

                {isShowedActivitiesList(name) && showActivity && (
                  <div className="flex flex-col gap-1">
                    {activities.map((activity) => (
                      <div
                        key={activity.id}
                        className="flex items-center gap-2 text-sm text-gray-700 font-semibold dark:text-dark-main"
                      >
                        <div className="flex items-center gap-1 ml-6">
                          <span>
                            &#8226;{" "}
                            {activity.name ? activity.name : "(no activity)"} -{" "}
                            {formatDuration(activity.duration)}
                          </span>
                        </div>
                        {period === "day" && (
                          <>
                            <Tooltip>
                              <button
                                className="group"
                                title="Copy activity descriptions without time"
                                onClick={() => {
                                  copyDescriptionsHandler(
                                    activity.descriptions,
                                    false
                                  );
                                }}
                              >
                                <DocumentIcon className="w-[18px] h-[18px] text-gray-600 group-hover:text-gray-900 group-hover:dark:text-dark-heading" />
                              </button>
                            </Tooltip>
                            <Tooltip>
                              <button
                                className="group"
                                title="Copy activity descriptions with time"
                                onClick={() => {
                                  copyDescriptionsHandler(
                                    activity.descriptions,
                                    true
                                  );
                                }}
                              >
                                <DocumentPlusIcon className="w-[18px] h-[18px] text-gray-600 group-hover:text-gray-900 group-hover:dark:text-dark-heading" />
                              </button>
                            </Tooltip>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {!totals.length && (
        <div className="text-sm text-gray-700 font-semibold pt-2 dark:text-dark-main ml-5">
          No tracked time this {period}
        </div>
      )}
    </section>
  );
};

export default Totals;
