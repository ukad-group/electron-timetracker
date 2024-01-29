import React, { useState, useEffect } from "react";
import { convertMillisecondsToTime } from "@/helpers/utils/datetime-ui";
import { useMainStore } from "@/store/mainStore";
import { shallow } from "zustand/shallow";
import { Description, Total, PeriodName } from "./types";
import { TOTAL_PERIODS } from "./constants";
import { IPC_MAIN_CHANNELS } from "@electron/helpers/constants";
import { getTotals } from "./utils";
import TotalsList from "./TotalsList";
import { Listbox } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/24/solid";

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

  return (
    <section className="px-4 py-5 bg-white shadow sm:rounded-lg sm:px-6 dark:bg-dark-container dark:border dark:border-dark-border">
      <h2 className="flex gap-1 items-center text-lg font-medium text-gray-900 dark:text-dark-heading">
        <div>
          <Listbox value={period} onChange={onChangeRange}>
            <Listbox.Button className="capitalize flex">
              Totals {period}
              <ChevronDownIcon
                className="w-3 h-3 ml-1 mt-2 dark:text-gray-200"
                aria-hidden="true"
              />
            </Listbox.Button>
            <Listbox.Options className="absolute z-10 py-1  ml-12 border border-gray-700 cursor-pointer rounded-lg dark:text-dark-heading  capitalize bg-white dark:bg-dark-container focus:outline-none">
              {TOTAL_PERIODS.map((period) => (
                <Listbox.Option
                  className="px-2 hover:bg-dark-button-gray-hover"
                  key={period.id}
                  value={period.name}
                >
                  {period.name}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Listbox>
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
