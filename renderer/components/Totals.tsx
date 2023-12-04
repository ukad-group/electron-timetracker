import {
  ChevronRightIcon,
  DocumentIcon,
  DocumentPlusIcon,
} from "@heroicons/react/24/outline";
import React, { useState, useEffect } from "react";
import Tooltip from "./ui/Tooltip/Tooltip";
import clsx from "clsx";
import { ReportActivity, formatDuration } from "../utils/reports";
import { convertMillisecondsToTime } from "../utils/datetime-ui";

interface Description {
  id: number;
  name: string;
  duration: number;
}

interface Activity extends Description {
  descriptions: Description[];
}

interface Total extends Activity {
  activities: Activity[];
}

const Totals = ({ activities }) => {
  const [totals, setTotals] = useState<Total[]>([]);
  const [showedProjects, setShowedProjects] = useState<string[]>([]);
  const isShowedActivitiesList = (projectName: string) => {
    return showedProjects.includes(projectName);
  };

  const getProjectTotals = () => {
    const totals = activities.reduce((acc: Total[], curr: ReportActivity) => {
      if (!curr.project || curr.project.startsWith("!")) return acc;

      const existingTotal = acc.find((item) => item.name === curr.project);
      const name = curr.activity
        ? `${curr.activity} - ${curr.description}`
        : curr.description;

      if (!existingTotal) {
        acc.push({
          id: curr.id,
          name: curr.project,
          duration: curr.duration,
          descriptions: [
            {
              id: curr.id,
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
            id: curr.id,
            name: name,
            duration: curr.duration,
          });
        }
      }

      return acc;
    }, []);

    return totals;
  };

  const getActivityTotals = (projectName: string) => {
    const filteredActivities = activities.filter(
      (activity: ReportActivity) => activity.project === projectName
    );

    const totals = filteredActivities.reduce(
      (acc: Activity[], curr: ReportActivity) => {
        const existingTotal = acc.find((item) => item.name === curr.activity);

        if (!existingTotal) {
          acc.push({
            id: curr.id,
            name: curr.activity,
            duration: curr.duration,
            descriptions: [
              {
                id: curr.id,
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
              id: curr.id,
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

  useEffect(() => {
    setShowedProjects([]);

    const initialProjectTotals = getProjectTotals();
    const sortedProjectTotals = sortTotals(initialProjectTotals);
    const fullProjectTotals = sortedProjectTotals.map((total: Total) => {
      const projectActivities = getActivityTotals(total.name);
      const sortedProjectActivities = sortTotals(projectActivities);

      return { ...total, activities: sortedProjectActivities };
    });

    setTotals(fullProjectTotals);
  }, [activities]);

  return (
    <div>
      <h2 className="text-lg font-medium text-gray-900 dark:text-dark-heading">
        Daily totals
      </h2>
      {activities.length > 0 && (
        <div className="flex flex-col gap-1 pt-2">
          {totals.map((total) => (
            <div key={total.id}>
              <div
                className={clsx(
                  "flex items-center gap-2 text-sm text-gray-700 font-semibold  dark:text-dark-main",
                  { "cursor-pointer": total.activities.length > 1 }
                )}
              >
                <div
                  className={clsx(
                    "flex items-center gap-1",
                    {
                      "ml-5": total.activities.length <= 1,
                    },
                    {
                      "hover:text-gray-400 dark:hover:text-white ml-0":
                        total.activities.length > 1,
                    }
                  )}
                  onClick={() => {
                    toggleActivitiesList(total.name);
                  }}
                >
                  {total.activities.length > 1 && (
                    <ChevronRightIcon
                      className={clsx("w-4 h-4", {
                        "rotate-90": isShowedActivitiesList(total.name),
                      })}
                    />
                  )}
                  <span>
                    {total.name} - {formatDuration(total.duration)}
                  </span>
                </div>
                <Tooltip>
                  <button
                    className="group"
                    title="Copy project descriptions without time"
                    onClick={() =>
                      copyDescriptionsHandler(total.descriptions, false)
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
                      copyDescriptionsHandler(total.descriptions, true)
                    }
                  >
                    <DocumentPlusIcon className="w-[18px] h-[18px] text-gray-600 group-hover:text-gray-900 group-hover:dark:text-dark-heading" />
                  </button>
                </Tooltip>
              </div>

              {isShowedActivitiesList(total.name) &&
                total.activities.length > 1 && (
                  <div className="flex flex-col">
                    {total.activities.map((activity) => (
                      <div
                        key={activity.id}
                        className="flex items-center gap-2 text-sm text-gray-700 font-semibold dark:text-dark-main"
                      >
                        <div className="flex items-center gap-1 ml-6">
                          <span>
                            &#8226;{" "}
                            {activity.name
                              ? activity.name
                              : "without filled activity"}{" "}
                            - {formatDuration(activity.duration)}
                          </span>
                        </div>
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
                      </div>
                    ))}
                  </div>
                )}
            </div>
          ))}
        </div>
      )}

      {!activities.length && (
        <div className="text-sm text-gray-700 font-semibold pt-2 dark:text-dark-main ">
          No tracked time
        </div>
      )}
    </div>
  );
};

export default Totals;
