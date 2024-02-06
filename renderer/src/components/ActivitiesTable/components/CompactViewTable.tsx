import { Fragment, useState, useContext, useEffect, useRef } from "react";
import clsx from "clsx";
import Tooltip from "@/shared/Tooltip/Tooltip";
import { checkIsToday, getCeiledTime } from "@/helpers/utils/datetime-ui";
import {
  PencilSquareIcon,
  Square2StackIcon,
} from "@heroicons/react/24/outline";
import { formatDuration } from "@/helpers/utils/reports";
import { PlusIcon } from "@heroicons/react/24/solid";
import { ActivitiesTableContext } from "../context";
import { Hint } from "@/shared/Hint";
import { useTutorialProgressStore } from "@/store/tutorialProgressStore";
import { shallow } from "zustand/shallow";
import { HINTS_GROUP_NAMES, HINTS_ALERTS } from "@/helpers/contstants";
import { changeHintConditions } from "@/helpers/utils/utils";
import usePrevious from "@/helpers/hooks/usePrevious";

const CompactViewTable = () => {
  const {
    tableActivities,
    ctrlPressed,
    copyToClipboardHandle,
    onEditActivity,
    activities,
    selectedDate,
    firstKey,
    secondKey,
    editActivityHandler,
    isLoading,
  } = useContext(ActivitiesTableContext);

  const firstRowRef = useRef(null);
  const firstEditButtonRef = useRef(null);
  const lastCopyButtonRef = useRef(null);
  const invalidTimeRef = useRef(null);
  const calendarEventRef = useRef(null);
  const [dublicateIndex, setDublicateIndex] = useState(-1);

  const [progress, setProgress] = useTutorialProgressStore(
    (state) => [state.progress, state.setProgress],
    shallow
  );
  useEffect(() => {
    changeHintConditions(progress, setProgress, [
      {
        groupName: HINTS_GROUP_NAMES.SHORTCUTS_EDITING,
        newConditions: [false, false],
        existingConditions: [false, false],
      },
      {
        groupName: HINTS_GROUP_NAMES.COPY_BUTTON,
        newConditions: [true, false],
        existingConditions: ["same", false],
      },
      {
        groupName: HINTS_GROUP_NAMES.ONLINE_CALENDAR_EVENT,
        newConditions: [false],
        existingConditions: [false],
      },
    ]);
  }, []);

  const prevTableActivities = usePrevious(tableActivities) || [];

  useEffect(() => {
    const isNewActivity =
      tableActivities?.length - prevTableActivities?.length === 1;
    if (
      prevTableActivities &&
      tableActivities &&
      isNewActivity &&
      progress[`${HINTS_GROUP_NAMES.COPY_BUTTON}Conditions`] &&
      progress[`${HINTS_GROUP_NAMES.COPY_BUTTON}Conditions`].includes(false)
    ) {
      const description =
        tableActivities[tableActivities.length - 1].description;
      tableActivities.forEach((item, index) => {
        if (
          index !== tableActivities.length - 1 &&
          item.description === description
        ) {
          setDublicateIndex(index);
          changeHintConditions(progress, setProgress, [
            {
              groupName: HINTS_GROUP_NAMES.COPY_BUTTON,
              newConditions: [true, true],
              existingConditions: ["same", true],
            },
          ]);
          return;
        }
      });
    }
    changeHintConditions(progress, setProgress, [
      {
        groupName: HINTS_GROUP_NAMES.EDITING_BUTTON,
        newConditions: [!isLoading],
        existingConditions: [!isLoading],
      },
      {
        groupName: HINTS_GROUP_NAMES.ONLINE_CALENDAR_EVENT,
        newConditions: [
          progress[HINTS_GROUP_NAMES.EDITING_BUTTON][0] && !isLoading,
        ],
        existingConditions: [
          progress[HINTS_GROUP_NAMES.EDITING_BUTTON][0] && !isLoading,
        ],
      },
    ]);
  }, [tableActivities]);

  const handleEditClick = (activity) => {
    changeHintConditions(progress, setProgress, [
      {
        groupName: HINTS_GROUP_NAMES.SHORTCUTS_EDITING,
        newConditions: [true, false],
        existingConditions: [true, false],
      },
    ]);
    editActivityHandler(activity);
  };

  const handleCopyClick = (activity) => {
    changeHintConditions(progress, setProgress, [
      {
        groupName: HINTS_GROUP_NAMES.COPY_BUTTON,
        newConditions: [false, false],
        existingConditions: [false, false],
      },
    ]);
    onEditActivity({
      ...activity,
      id: null,
      from: activities[activities.length - 2].to,
      to: checkIsToday(selectedDate) ? getCeiledTime() : "",
      duration: null,
    });
  };

  return (
    tableActivities.length > 0 && (
      <>
        <Hint
          displayCondition
          learningMethod="ctrlArrowNumberPress"
          order={1}
          groupName={HINTS_GROUP_NAMES.SHORTCUTS_EDITING}
          referenceRef={firstRowRef}
          shiftY={25}
          shiftX={150}
          width={"small"}
          position={{
            basePosition: "bottom",
            diagonalPosition: "left",
          }}
        >
          {HINTS_ALERTS.SHORTCUTS_EDITING}
        </Hint>

        <Hint
          displayCondition
          learningMethod="buttonClick"
          order={1}
          groupName={HINTS_GROUP_NAMES.COPY_BUTTON}
          referenceRef={lastCopyButtonRef}
          shiftY={150}
          shiftX={50}
          width={"medium"}
          position={{
            basePosition: "left",
            diagonalPosition: "bottom",
          }}
        >
          {HINTS_ALERTS.COPY_BUTTON}
        </Hint>

        {tableActivities?.map((activity, i) => (
          <Fragment key={i}>
            <tr className={activity.isBreak && "opacity-70 diagonalLines "}>
              <td
                className={`w-24 relative pt-4 pl-1 pr-1 text-sm whitespace-nowrap sm:pl-6 md:pl-0 ${
                  activity.calendarId ? "opacity-50" : ""
                }`}
              >
                {ctrlPressed && (
                  <span className="absolute -left-4 text-blue-700">
                    {i + 1}
                  </span>
                )}
                {!activity.isValid && (
                  <Hint
                    learningMethod="buttonClick"
                    order={1}
                    groupName={HINTS_GROUP_NAMES.VALIDATION}
                    referenceRef={invalidTimeRef}
                    shiftY={150}
                    shiftX={50}
                    width={"medium"}
                    position={{
                      basePosition: "bottom",
                      diagonalPosition: "left",
                    }}
                  >
                    {HINTS_ALERTS.VALIDATION}
                  </Hint>
                )}
                <span
                  ref={
                    activity.isValid !== undefined && !activity.isValid
                      ? invalidTimeRef
                      : undefined
                  }
                  className={clsx("flex gap-1", {
                    "py-1 px-1 rounded-full font-medium bg-red-100 text-red-800 dark:text-red-400 dark:bg-red-400/20":
                      !activity.isValid,
                  })}
                >
                  {activity.from} - {activity.to}
                </span>
              </td>

              <td
                className={`relative px-1 pt-4 ${
                  activity.calendarId ? "opacity-50" : ""
                }`}
              >
                <div className="flex flex-wrap gap-x-2 items-center">
                  <div className="flex gap-1">
                    {activity.isNewProject && !activity.isBreak && (
                      <p className="flex items-center shrink-0 w-fit h-fit text-xs px-1.5 py-0.5 rounded-full bg-green-100 text-green-800 dark:text-green-400 dark:bg-green-400/20 ">
                        new
                      </p>
                    )}
                    <Tooltip>
                      <p
                        className="text-sm font-medium text-gray-900 dark:text-dark-heading old-break-word"
                        onClick={copyToClipboardHandle}
                      >
                        {!activity.isBreak && activity.project}
                      </p>
                    </Tooltip>
                  </div>

                  {activity.activity && (
                    <Tooltip>
                      <p
                        className="block text-xs font-semibold old-break-word text-gray-500 dark:text-slate-400"
                        onClick={copyToClipboardHandle}
                      >
                        {activity.activity}
                      </p>
                    </Tooltip>
                  )}
                </div>
              </td>

              <td className="relative text-sm font-medium text-right whitespace-nowrap">
                <div className={`${activity.calendarId ? "invisible" : ""}`}>
                  <button
                    className="group pt-4 px-1"
                    title="Copy"
                    onClick={() => {
                      handleCopyClick(activity);
                    }}
                  >
                    <Square2StackIcon
                      ref={
                        !activity.calendarId && dublicateIndex === i
                          ? lastCopyButtonRef
                          : undefined
                      }
                      className="w-[18px] h-[18px] text-gray-600 group-hover:text-gray-900 group-hover:dark:text-dark-heading"
                    />
                  </button>
                </div>
              </td>
            </tr>
            <tr
              ref={!activity.calendarId ? firstRowRef : undefined}
              className={clsx(
                `border-b border-gray-200 dark:border-gray-300 transition-transform `,
                {
                  "border-dashed border-b-2 border-gray-200 dark:border-gray-400":
                    (tableActivities[i + 1] &&
                      tableActivities[i + 1].isBreak) ||
                    activity.isBreak,
                  "opacity-80 diagonalLines": activity.isBreak,
                  "dark:border-b-2 dark:border-zinc-800": activity.calendarId,
                  "scale-105 ":
                    (Number(firstKey) === i + 1 && !secondKey) ||
                    (Number(firstKey + secondKey) === i + 1 && secondKey),
                }
              )}
            >
              <td
                colSpan={2}
                className={`relative pb-4 pl-1 pr-1 text-sm sm:pl-6 md:pl-0 ${
                  activity.calendarId ? "opacity-50" : ""
                }`}
              >
                <div className="flex flex-nowrap gap-1 items-center">
                  <Tooltip>
                    <p
                      data-column="duration"
                      onClick={copyToClipboardHandle}
                      className={`w-12 text-sm font-medium text-gray-900 dark:text-dark-heading whitespace-nowrap ${
                        activity.calendarId ? "opacity-50" : ""
                      }`}
                    >
                      {`${formatDuration(activity.duration)}`}
                    </p>
                  </Tooltip>
                  <Tooltip>
                    <p
                      onClick={copyToClipboardHandle}
                      className={clsx("old-break-word", {
                        "py-1 px-2 -mx-2 rounded-full font-medium bg-yellow-100 text-yellow-800 dark:text-yellow-400 dark:bg-yellow-400/20":
                          activity.mistakes?.includes("startsWith!"),
                      })}
                    >
                      {activity.isBreak
                        ? activity.project
                        : activity.description}
                    </p>
                    {activity.mistakes?.includes("startsWith!") && (
                      <span className="block text-xs mt-1">
                        Perhaps you wanted to report a break
                      </span>
                    )}
                  </Tooltip>
                </div>
              </td>

              <td className="relative text-sm font-medium text-right whitespace-nowrap">
                <button
                  className="group pb-4 px-1"
                  title={activity.calendarId ? "Add" : "Edit"}
                  onClick={() => {
                    handleEditClick(activity);
                  }}
                >
                  {!activity.calendarId && (
                    <>
                      <Hint
                        learningMethod="buttonClick"
                        order={1}
                        groupName={HINTS_GROUP_NAMES.EDITING_BUTTON}
                        referenceRef={firstEditButtonRef}
                        shiftY={30}
                        shiftX={200}
                        width={"small"}
                        position={{
                          basePosition: "bottom",
                          diagonalPosition: "left",
                        }}
                      >
                        {HINTS_ALERTS.EDITING_BUTTON}
                      </Hint>
                      <PencilSquareIcon
                        ref={firstEditButtonRef}
                        className="w-[18px] h-[18px] text-gray-600 group-hover:text-gray-900 group-hover:dark:text-dark-heading"
                      />
                    </>
                  )}
                  {activity.calendarId &&
                    progress["editButton"] &&
                    !progress["editButton"].includes(false) && (
                      <Hint
                        learningMethod="buttonClick"
                        order={1}
                        groupName={HINTS_GROUP_NAMES.ONLINE_CALENDAR_EVENT}
                        referenceRef={calendarEventRef}
                        shiftY={200}
                        shiftX={50}
                        width={"medium"}
                        position={{
                          basePosition: "left",
                          diagonalPosition: "bottom",
                        }}
                      >
                        {HINTS_ALERTS.ONLINE_CALENDAR_EVENT}
                      </Hint>
                    )}

                  {activity.calendarId && (
                    <PlusIcon
                      ref={activity.calendarId ? calendarEventRef : undefined}
                      className="w-[18px] h-[18px] text-gray-600 group-hover:text-gray-900 group-hover:dark:text-dark-heading"
                    />
                  )}
                </button>
              </td>
            </tr>
          </Fragment>
        ))}
      </>
    )
  );
};

export default CompactViewTable;
