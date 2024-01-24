import React from "react";
import clsx from "clsx";
import {
  ChevronRightIcon,
  DocumentIcon,
  DocumentPlusIcon,
} from "@heroicons/react/24/outline";
import { formatDurationAsDecimals } from "@/helpers/utils/reports";
import Tooltip from "@/shared/Tooltip/Tooltip";

const TotalsList = ({
  totals,
  toggleActivitiesList,
  isShowedActivitiesList,
  period,
  onCopyDescriptions,
}) =>
  totals.map(({ id, name, duration, activities, descriptions }) => {
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
                "ml-5 relative before:rounded-full before:block before:content-[''] before:w-2 before:h-2 before:bg-gray-400 before:absolute before:-left-4 before:top-1/2 before:-translate-y-1/2":
                  !showActivity,
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
              {name} - {formatDurationAsDecimals(duration)}
            </span>
          </div>
          {period === "day" && (
            <>
              <Tooltip>
                <button
                  className="group"
                  title="Copy project descriptions without time"
                  onClick={() => onCopyDescriptions(descriptions, false)}
                >
                  <DocumentIcon className="w-[18px] h-[18px] text-gray-600 group-hover:text-gray-900 group-hover:dark:text-dark-heading" />
                </button>
              </Tooltip>
              <Tooltip>
                <button
                  className="group"
                  title="Copy project descriptions with time"
                  onClick={() => onCopyDescriptions(descriptions, true)}
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
                    &#8226; {activity.name ? activity.name : "(no activity)"} -{" "}
                    {formatDurationAsDecimals(activity.duration)}
                  </span>
                </div>
                {period === "day" && (
                  <>
                    <Tooltip>
                      <button
                        className="group"
                        title="Copy activity descriptions without time"
                        onClick={() => {
                          onCopyDescriptions(activity.descriptions, false);
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
                          onCopyDescriptions(activity.descriptions, true);
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
  });

export default TotalsList;
