import React, { useState, useEffect, useRef } from "react";
import { convertMillisecondsToTime } from "@/helpers/utils/datetime-ui";
import { useMainStore } from "@/store/mainStore";
import { useTutorialProgressStore } from "@/store/tutorialProgressStore";
import { shallow } from "zustand/shallow";
import { Description, Total, PeriodName } from "./types";
import { TOTAL_PERIODS } from "./constants";
import { IPC_MAIN_CHANNELS } from "@electron/helpers/constants";
import { getTotals } from "./utils";
import TotalsList from "./TotalsList";
import { Hint } from "@/shared/Hint";
import { SCREENS } from "@/constants";
import { HINTS_GROUP_NAMES, HINTS_ALERTS } from "@/helpers/contstants";
import { changeHintConditions } from "@/helpers/utils/utils";
import useScreenSizes from "@/helpers/hooks/useScreenSizes";

const Totals = ({ selectedDate }) => {
  const [reportsFolder] = useMainStore(
    (state) => [state.reportsFolder, state.setReportsFolder],
    shallow
  );
  const [progress, setProgress] = useTutorialProgressStore(
    (state) => [state.progress, state.setProgress],
    shallow
  );
  const [totals, setTotals] = useState<Total[]>([]);
  const [period, setPeriod] = useState<PeriodName>("day");
  const { screenSizes } = useScreenSizes();
  const [showedProjects, setShowedProjects] = useState<string[]>([]);
  const totalsRef = useRef(null);
  const totalsSelectRef = useRef(null);
  const isShowedActivitiesList = (projectName: string) => {
    return showedProjects.includes(projectName);
  };

  useEffect(() => {
    getTotals({
      period,
      selectedDate,
      reportsFolder,
      setTotals,
    });

    const fileChangeListener = () => {
      getTotals({
        period,
        selectedDate,
        reportsFolder,
        setTotals,
      });
    };

    global.ipcRenderer.on(
      IPC_MAIN_CHANNELS.ANY_FILE_CHANGED,
      fileChangeListener
    );

    return () => {
      global.ipcRenderer.removeListener(
        IPC_MAIN_CHANNELS.ANY_FILE_CHANGED,
        fileChangeListener
      );
    };
  }, [selectedDate, period]);

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

  const renderTotalPeriods = (totalPeriods) =>
    totalPeriods.map((range) => (
      <option key={range.id} value={range.name}>
        {range.name}
      </option>
    ));

  useEffect(() => {
    changeHintConditions(progress, setProgress, [
      {
        groupName: HINTS_GROUP_NAMES.TOTALS,
        newConditions: [false],
        existingConditions: [false],
      },
    ]);
  }, []);

  useEffect(() => {
    setProgress(progress);
  }, [screenSizes]);

  const onFocusHandler = () => {
    changeHintConditions(progress, setProgress, [
      {
        groupName: HINTS_GROUP_NAMES.TOTALS,
        newConditions: [true],
        existingConditions: [true],
      },
    ]);
  };
  return (
    <section
      onFocus={onFocusHandler}
      className="px-4 py-5 bg-white shadow sm:rounded-lg sm:px-6 dark:bg-dark-container dark:border dark:border-dark-border"
    >
      {screenSizes.screenWidth >= SCREENS.LG && (
        <>
          <Hint
            displayCondition
            learningMethod="nextClick"
            order={1}
            groupName={HINTS_GROUP_NAMES.TOTALS}
            referenceRef={totalsRef}
            shiftY={200}
            shiftX={50}
            width={"medium"}
            position={{
              basePosition: "left",
              diagonalPosition: "top",
            }}
          >
            {HINTS_ALERTS.TOTALS}
          </Hint>
          <Hint
            learningMethod="buttonClick"
            order={2}
            groupName={HINTS_GROUP_NAMES.TOTALS}
            referenceRef={totalsSelectRef}
            shiftY={50}
            shiftX={200}
            width={"small"}
            position={{
              basePosition: "top",
              diagonalPosition: "left",
            }}
          >
            {HINTS_ALERTS.TOTALS_PERIOD}
          </Hint>
        </>
      )}

      {screenSizes.screenWidth < SCREENS.LG && (
        <>
          <Hint
            displayCondition
            learningMethod="nextClick"
            order={1}
            groupName={HINTS_GROUP_NAMES.TOTALS}
            referenceRef={totalsRef}
            shiftY={50}
            shiftX={200}
            width={"medium"}
            position={{
              basePosition: "top",
              diagonalPosition: "right",
            }}
          >
            {HINTS_ALERTS.TOTALS}
          </Hint>
          <Hint
            learningMethod="buttonClick"
            order={2}
            groupName={HINTS_GROUP_NAMES.TOTALS}
            referenceRef={totalsSelectRef}
            shiftY={50}
            shiftX={220}
            width={"small"}
            position={{
              basePosition: "top",
              diagonalPosition: "right",
            }}
          >
            {HINTS_ALERTS.TOTALS_PERIOD}
          </Hint>
        </>
      )}

      <h2
        ref={totalsRef}
        className="flex gap-1 items-center text-lg font-medium text-gray-900 dark:text-dark-heading"
      >
        <div>
          <label htmlFor="select">Totals</label>
          <select
            ref={totalsSelectRef}
            className="cursor-pointer rounded-lg dark:text-dark-heading px-1 capitalize bg-white dark:bg-dark-container focus:outline-none"
            id="select"
            value={period}
            onChange={(e) => onChangeRange(e.target.value as PeriodName)}
          >
            {renderTotalPeriods(TOTAL_PERIODS)}
          </select>
        </div>
      </h2>
      {totals.length > 0 && (
        <div className="flex flex-col gap-2 pt-2">
          <TotalsList
            totals={totals}
            toggleActivitiesList={toggleActivitiesList}
            isShowedActivitiesList={isShowedActivitiesList}
            period={period}
            onCopyDescriptions={copyDescriptionsHandler}
          />
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
