import { useEffect, useState, useRef } from "react";
import { Button } from "@/shared/Button";
import { DeleteMessage } from "@/shared/DeleteMessage";
import { useMainStore } from "@/store/mainStore";
import { useTutorialProgressStore } from "@/store/tutorialProgressStore";
import { shallow } from "zustand/shallow";
import { useEditingHistoryManager } from "@/helpers/hooks";
import { KeyboardEventProps, ManualInputFormProps } from "./types";
import { IPC_MAIN_CHANNELS } from "@electron/helpers/constants";
import { Hint } from "@/shared/Hint";
import { HINTS_GROUP_NAMES, HINTS_ALERTS, KEY_CODES } from "@/helpers/constants";
import { changeHintConditions } from "@/helpers/utils/utils";
import { TRACK_ANALYTICS } from "@/helpers/constants";
import { getReportWithCopiedLine } from "./utils";

const ManualInputForm = ({
  saveReportTrigger,
  onSave,
  selectedDateReport,
  selectedDate,
  setSelectedDateReport,
}: ManualInputFormProps) => {
  const [reportsFolder] = useMainStore((state) => [state.reportsFolder, state.setReportsFolder], shallow);
  const [report, setReport] = useState("");
  const [saveBtnStatus, setSaveBtnStatus] = useState("disabled");
  const textareaRef = useRef(null);
  const [showDeleteMessage, setShowDeleteMessage] = useState(false);
  const [showDeleteButton, setShowDeleteButton] = useState(false);
  const [isFileExist, setIsFileExist] = useState(false);
  const editingHistoryManager = useEditingHistoryManager(report);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [progress, setProgress] = useTutorialProgressStore((state) => [state.progress, state.setProgress], shallow);
  const isReportChanged = selectedDateReport !== report;

  const readReport = async () => {
    const dayReport = await global.ipcRenderer.invoke(
      IPC_MAIN_CHANNELS.APP_READ_DAY_REPORT,
      reportsFolder,
      selectedDate,
    );

    setIsFileExist(dayReport !== null);
    setShowDeleteButton(dayReport === "");
  };

  const handleCtrlSSave = (e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.code === KEY_CODES.KEY_S && saveBtnStatus === "enabled") {
      handleSaveReport();
    }
  };

  const handleSaveReport = () => {
    global.ipcRenderer.send(IPC_MAIN_CHANNELS.ANALYTICS_DATA, TRACK_ANALYTICS.MANUAL_SAVE);
    onSave(report, true);
    setSaveBtnStatus("inprogress");

    if (isFileExist) {
      setShowDeleteButton(!report.length);
    } else {
      setShowDeleteButton(false);
    }
  };

  const handleSetReport = (report: string) => {
    setSaveBtnStatus(selectedDateReport !== report ? "enabled" : "disabled");
    setReport(report);
  };

  const handleTextAreaKeyDown = (e: KeyboardEventProps) => {
    if ((e.ctrlKey || e.metaKey) && e.code === KEY_CODES.KEY_D) {
      e.preventDefault();
      handleSetReport(getReportWithCopiedLine(textareaRef, report));
    }

    if ((e.ctrlKey || e.metaKey) && e.code === KEY_CODES.KEY_Z) {
      e.preventDefault();
      const [currentValue, changePlace] = editingHistoryManager.undoEditing();

      if (typeof currentValue === "string") {
        setReport(currentValue);
        setCursorPosition(typeof changePlace === "number" ? changePlace : 0);
      }
    }

    if ((e.ctrlKey || e.metaKey) && e.code === KEY_CODES.KEY_Y) {
      e.preventDefault();
      const [currentValue, changePlace] = editingHistoryManager.redoEditing();

      if (typeof currentValue === "string") {
        setReport(currentValue);
        setCursorPosition(typeof changePlace === "number" ? changePlace : 0);
      }
    }
  };

  const handleOnFocus = () => {
    changeHintConditions(progress, setProgress, [
      {
        groupName: HINTS_GROUP_NAMES.MANUAL_INPUT,
        newConditions: [true],
        existingConditions: [true],
      },
    ]);
  };

  useEffect(() => {
    changeHintConditions(progress, setProgress, [
      {
        groupName: HINTS_GROUP_NAMES.MANUAL_INPUT,
        newConditions: [false],
        existingConditions: [false],
      },
    ]);
  }, []);

  useEffect(() => {
    setShowDeleteMessage(false);
  }, [selectedDate]);

  useEffect(() => {
    handleSetReport(selectedDateReport);
  }, [selectedDateReport]);

  useEffect(() => {
    readReport();

    editingHistoryManager.setValue(report);
    handleSetReport(report);

    if (isFileExist) {
      setShowDeleteButton(!report.length);
    } else {
      setShowDeleteButton(false);
    }

    if (cursorPosition) {
      textareaRef.current.setSelectionRange(cursorPosition, cursorPosition);
    }
    setCursorPosition(0);

    document.addEventListener("keydown", handleCtrlSSave);

    return () => {
      document.removeEventListener("keydown", handleCtrlSSave);
    };
  }, [report]);

  useEffect(() => {
    if (saveReportTrigger && isReportChanged) {
      global.ipcRenderer.send(IPC_MAIN_CHANNELS.ANALYTICS_DATA, TRACK_ANALYTICS.MANUAL_SAVE);
      onSave(report, true);
    }
  }, [saveReportTrigger]);

  return (
    <div>
      <Hint
        displayCondition
        learningMethod="nextClick"
        order={1}
        groupName={HINTS_GROUP_NAMES.MANUAL_INPUT}
        referenceRef={textareaRef}
        shiftY={30}
        shiftX={200}
        width={"medium"}
        position={{
          basePosition: "bottom",
          diagonalPosition: "left",
        }}
      >
        {HINTS_ALERTS.MANUAL_INPUT}
      </Hint>

      <h2 id="manual-input-title" className="text-lg font-medium text-gray-900 dark:text-dark-heading">
        Manual input
      </h2>

      <textarea
        value={report}
        onFocus={handleOnFocus}
        onChange={(e) => handleSetReport(e.target.value)}
        rows={15}
        className="block w-full px-3 py-2 mt-3 border border-gray-300 rounded-md shadow-sm focus-visible:outline-blue-500 sm:text-sm dark:bg-dark-back dark:border-dark-border dark:text-slate-400 focus-visible:dark:outline-slate-500"
        spellCheck={true}
        ref={textareaRef}
        onKeyDown={handleTextAreaKeyDown}
      />
      <div className="relative flex flex-col gap-4 mt-6 justify-stretch">
        {showDeleteMessage && (
          <DeleteMessage
            setShowDeleteButton={setShowDeleteButton}
            setShowDeleteMessage={setShowDeleteMessage}
            selectedDate={selectedDate}
            setSelectedDateReport={setSelectedDateReport}
          />
        )}
        <div className="flex flex-col justify-stretch">
          <Button
            text="Save"
            callback={handleSaveReport}
            status={saveBtnStatus}
            disabled={saveBtnStatus === "disabled"}
            type={"button"}
          />
          <span className="block text-xs text-gray-500 text-center">or press ctrl/command + s</span>
        </div>
        {showDeleteButton && (
          <button
            onClick={() => setShowDeleteMessage(true)}
            type="button"
            className="inline-flex w-full justify-center rounded-md bg-red-100 px-3 py-2 text-sm font-semibold text-red-800 hover:text-white shadow-sm hover:bg-red-600 sm:w-auto dark:text-dark-heading dark:border dark:border-red-500/50 hover:dark:border-transparent dark:bg-transparent hover:dark:bg-red-400/20"
          >
            Remove an empty file
          </button>
        )}
      </div>
    </div>
  );
};

export default ManualInputForm;
