import { useState, useContext, useEffect, useRef } from "react";
import clsx from "clsx";
import Tooltip from "@/shared/Tooltip/Tooltip";
import { formatDuration } from "@/helpers/utils/reports";
import {
  PencilSquareIcon,
  Square2StackIcon,
} from "@heroicons/react/24/outline";
import { PlusIcon } from "@heroicons/react/24/solid";
import { ActivitiesTableContext } from "../context";
import { Hint } from "@/shared/Hint";
import { useTutorialProgressStore } from "@/store/tutorialProgressStore";
import { shallow } from "zustand/shallow";
import { HINTS_GROUP_NAMES, HINTS_ALERTS } from "@/helpers/contstants";
import { SCREENS } from "@/constants";
import { changeHintConditions } from "@/helpers/utils/utils";
import useScreenSizes from "@/helpers/hooks/useScreenSizes";
import usePrevious from "@/helpers/hooks/usePrevious";

const MainViewTable = () => {
  const {
    tableActivities,
    ctrlPressed,
    firstKey,
    secondKey,
    copyToClipboardHandle,
    copyActivityHandler,
    editActivityHandler,
    isLoading,
  } = useContext(ActivitiesTableContext);

  const firstRowRef = useRef(null);
  const firstEditButtonRef = useRef(null);
  const lastCopyButtonRef = useRef(null);
  const invalidTimeRef = useRef(null);
  const calendarEventRef = useRef(null);
  const [dublicateIndex, setDublicateIndex] = useState(-1);
  const { screenSizes } = useScreenSizes();

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
      {
        groupName: HINTS_GROUP_NAMES.EDITING_BUTTON,
        newConditions: [false],
        existingConditions: [false],
      },
      {
        groupName: HINTS_GROUP_NAMES.TRACK_TIME_MODAL,
        newConditions: [
          false,
          false,
          false,
          false,
          false,
          false,
          false,
          false,
          false,
          false,
        ],
        existingConditions: [
          "same",
          "same",
          "same",
          "same",
          "same",
          "same",
          "same",
          "same",
          "same",
          "same",
        ],
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

  useEffect(() => {
    setProgress(progress);
  }, [screenSizes]);

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
    copyActivityHandler(activity);
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
            diagonalPosition: "right",
          }}
        >
          {HINTS_ALERTS.SHORTCUTS_EDITING}
        </Hint>

        {screenSizes.screenWidth >= SCREENS.LG && (
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
              basePosition: "right",
              diagonalPosition: "bottom",
            }}
          >
            {HINTS_ALERTS.COPY_BUTTON}
          </Hint>
        )}
        {screenSizes.screenWidth < SCREENS.LG && (
          <Hint
            displayCondition
            learningMethod="buttonClick"
            order={1}
            groupName={HINTS_GROUP_NAMES.COPY_BUTTON}
            referenceRef={lastCopyButtonRef}
            shiftY={250}
            shiftX={50}
            width={"medium"}
            position={{
              basePosition: "left",
              diagonalPosition: "bottom",
            }}
          >
            {HINTS_ALERTS.COPY_BUTTON}
          </Hint>
        )}

        {tableActivities?.map((activity, i) => (
          <tr
            key={i}
            ref={!activity.calendarId ? firstRowRef : undefined}
            className={clsx(
              `border-b border-gray-200 dark:border-gray-300 transition-transform `,
              {
                "border-dashed border-b-2 border-gray-200/80 dark:border-gray-400/80":
                  (tableActivities[i + 1] && tableActivities[i + 1].isBreak) ||
                  activity.isBreak,
                "opacity-70 diagonalLines": activity.isBreak,
                "dark:border-b-2 dark:border-zinc-800": activity.calendarId,
                "scale-105 ":
                  (Number(firstKey) === i + 1 && !secondKey) ||
                  (Number(firstKey + secondKey) === i + 1 && secondKey),
              }
            )}
          >
            <td
              className={`relative  pl-4 pr-3 text-sm  whitespace-nowrap sm:pl-6 md:pl-0 ${
                activity.calendarId ? "opacity-50" : ""
              }`}
            >
              {ctrlPressed && (
                <span className="absolute -left-4 text-blue-700">{i + 1}</span>
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
                    basePosition: "right",
                    diagonalPosition: "top",
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
                className={clsx({
                  "py-1 px-2 -mx-2 rounded-full font-medium bg-red-100 text-red-800 dark:text-red-400 dark:bg-red-400/20":
                    activity.isValid !== undefined && !activity.isValid,
                })}
              >
                {activity.from} - {activity.to}
              </span>
            </td>
            <td
              className={`px-3  text-sm font-medium text-gray-900 dark:text-dark-heading whitespace-nowrap ${
                activity.calendarId ? "opacity-50" : ""
              }`}
            >
              <Tooltip isClickable>
                <p data-column="duration" onClick={copyToClipboardHandle}>
                  {formatDuration(activity.duration)}
                </p>
              </Tooltip>
            </td>
            <td
              className={`relative px-3  ${
                activity.calendarId ? "opacity-50" : ""
              }`}
            >
              <div className="flex items-center gap-1">
                <Tooltip isClickable>
                  <p
                    className="text-sm font-medium text-gray-900 dark:text-dark-heading"
                    onClick={copyToClipboardHandle}
                  >
                    {!activity.isBreak && activity.project}
                  </p>
                </Tooltip>
                {activity.isNewProject && !activity.isBreak && (
                  <p className="flex items-center h-fit w-fit text-xs px-1.5 py-0.5 rounded-full bg-green-100 text-green-800 dark:text-green-400 dark:bg-green-400/20 ">
                    new
                  </p>
                )}
              </div>
              {activity.activity && (
                <Tooltip isClickable>
                  <p
                    className="block text-xs font-semibold mt-1 old-break-word "
                    onClick={copyToClipboardHandle}
                  >
                    {activity.activity}
                  </p>
                </Tooltip>
              )}
            </td>
            <td
              className={`px-3 text-sm ${
                activity.calendarId ? "opacity-50" : ""
              }`}
            >
              {activity.description && (
                <Tooltip isClickable>
                  <p onClick={copyToClipboardHandle} className="old-break-word">
                    {activity.description}
                  </p>
                </Tooltip>
              )}
              {activity.isBreak && (
                <p onClick={copyToClipboardHandle} className="old-break-word">
                  {activity.project}
                </p>
              )}
              {activity.mistakes && (
                <p
                  onClick={copyToClipboardHandle}
                  className="w-fit old-break-word py-1 px-2 -mx-2 rounded-2xl font-medium bg-yellow-100 text-yellow-800 dark:text-yellow-400 dark:bg-yellow-400/20"
                >
                  {activity.mistakes}
                </p>
              )}
            </td>
            <td className="relative text-sm font-medium text-right whitespace-nowrap">
              {!activity.isBreak && (
                <div className={`${activity.calendarId ? "invisible" : ""}`}>
                  <button
                    className="group py-4 px-3"
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
              )}
            </td>
            <td className="relative text-sm font-medium text-right whitespace-nowrap">
              {!activity.isBreak && (
                <button
                  className="group py-4 px-3"
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
              )}
            </td>
          </tr>
        ))}
      </>
    )
  );
};

export default MainViewTable;
