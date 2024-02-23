import { useEffect, useState, useRef } from "react";
import { Button } from "@/shared/Button";
import { DeleteMessage } from "@/shared/DeleteMessage";
import { parseReport, serializeReport } from "@/helpers/utils/reports";
import { getCurrentTimeRoundedUp } from "@/helpers/utils/datetime-ui";
import { useMainStore } from "@/store/mainStore";
import { useTutorialProgressStore } from "@/store/tutorialProgressStore";
import { shallow } from "zustand/shallow";
import { useEditingHistoryManager } from "@/helpers/hooks";
import { ManualInputFormProps } from "./types";
import { IPC_MAIN_CHANNELS } from "@electron/helpers/constants";
import { Hint } from "@/shared/Hint";
import { HINTS_GROUP_NAMES, HINTS_ALERTS } from "@/helpers/contstants";
import { changeHintConditions } from "@/helpers/utils/utils";
import { TRACK_ANALYTICS } from "@/helpers/contstants";

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

  const saveOnPressHandler = (e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.code === "KeyS" && saveBtnStatus === "enabled") {
      saveReportHandler();
    }
  };

  useEffect(() => {
    setShowDeleteMessage(false);
  }, [selectedDate]);

  useEffect(() => {
    setReportHandler(selectedDateReport);
  }, [selectedDateReport]);

  useEffect(() => {
    readReport();

    editingHistoryManager.setValue(report);
    setReportHandler(report);

    if (isFileExist) {
      setShowDeleteButton(!report.length);
    } else {
      setShowDeleteButton(false);
    }

    if (cursorPosition) {
      textareaRef.current.setSelectionRange(cursorPosition, cursorPosition);
    }
    setCursorPosition(0);

    document.addEventListener("keydown", saveOnPressHandler);

    return () => {
      document.removeEventListener("keydown", saveOnPressHandler);
    };
  }, [report]);

  useEffect(() => {
    if (saveReportTrigger && isReportChanged) {
      global.ipcRenderer.send(IPC_MAIN_CHANNELS.ANALYTICS_DATA, "manuall_save");
      onSave(report, true);
    }
  }, [saveReportTrigger]);

  const readReport = async () => {
    const dayReport = await global.ipcRenderer.invoke(IPC_MAIN_CHANNELS.READ_DAY_REPORT, reportsFolder, selectedDate);

    setIsFileExist(dayReport !== null);
    setShowDeleteButton(dayReport === "");
  };

  const saveReportHandler = () => {
    global.ipcRenderer.send(IPC_MAIN_CHANNELS.ANALYTICS_DATA, TRACK_ANALYTICS.MANUAL_SAVE);
    onSave(report, true);
    setSaveBtnStatus("inprogress");

    if (isFileExist) {
      setShowDeleteButton(!report.length);
    } else {
      setShowDeleteButton(false);
    }
  };

  const setReportHandler = (report: string) => {
    setSaveBtnStatus(isReportChanged ? "enabled" : "disabled");
    setReport(report);
  };

  const textAreaKeyHandler = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.code === "KeyD") {
      e.preventDefault();
      copyCurrentLine();
    }

    if ((e.ctrlKey || e.metaKey) && e.code === "KeyZ") {
      e.preventDefault();
      const [currentValue, changePlace] = editingHistoryManager.undoEditing();

      if (typeof currentValue === "string") {
        setReport(currentValue);
        setCursorPosition(typeof changePlace === "number" ? changePlace : 0);
      }
    }

    if ((e.ctrlKey || e.metaKey) && e.code === "KeyY") {
      e.preventDefault();
      const [currentValue, changePlace] = editingHistoryManager.redoEditing();

      if (typeof currentValue === "string") {
        setReport(currentValue);
        setCursorPosition(typeof changePlace === "number" ? changePlace : 0);
      }
    }
  };

  const getCurrentCursorLineValue = (textarea: HTMLTextAreaElement, report: string) => {
    const cursorPosition = textarea.selectionStart;
    const currentLineStart = report.lastIndexOf("\n", cursorPosition - 1) + 1;
    const currentLineEnd = report.indexOf("\n", cursorPosition);

    return report.slice(currentLineStart, currentLineEnd !== -1 ? currentLineEnd : undefined);
  };

  const copyCurrentLine = () => {
    const textarea = textareaRef.current;
    const reportAndNotes = parseReport(report);
    const activities = reportAndNotes[0] || [];
    const lastActivity = activities[activities.length - 1];

    if (textarea) {
      const currentLineValue = getCurrentCursorLineValue(textarea, report);
      const isCursorOnRegistration = parseReport(currentLineValue)[0]?.length !== 0;

      if (!isCursorOnRegistration) return;
      const currentLineItems = currentLineValue.split(" - ");

      // forbid copying the end of the day
      if (currentLineItems.length <= 2 && !currentLineItems[1]?.trim()) return;

      const project = currentLineItems[1];
      let activity = "";
      let description = "";

      if (currentLineItems.length === 3) {
        description = currentLineItems[2];
      }

      if (currentLineItems.length === 4) {
        activity = currentLineItems[2];
        description = currentLineItems[3];
      }

      // if user hasn't end of the day
      if (!lastActivity.isBreak) {
        activities.push({
          from: getCurrentTimeRoundedUp(),
          project: project,
          activity: activity,
          description: description,
          to: getCurrentTimeRoundedUp(),
        });
      } else {
        lastActivity.project = project;
        lastActivity.activity = activity;
        lastActivity.description = description;
        lastActivity.to = getCurrentTimeRoundedUp();
      }
    }

    const serializedReport =
      serializeReport(activities) +
      (!reportAndNotes[1] || reportAndNotes[1].startsWith("undefined") ? "" : reportAndNotes[1]);

    setReportHandler(serializedReport);
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

  const onFocusHandler = () => {
    changeHintConditions(progress, setProgress, [
      {
        groupName: HINTS_GROUP_NAMES.MANUAL_INPUT,
        newConditions: [true],
        existingConditions: [true],
      },
    ]);
  };

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
        onFocus={onFocusHandler}
        onChange={(e) => setReportHandler(e.target.value)}
        rows={15}
        className="block w-full px-3 py-2 mt-3 border border-gray-300 rounded-md shadow-sm focus-visible:outline-blue-500 sm:text-sm dark:bg-dark-back dark:border-dark-border dark:text-slate-400 focus-visible:dark:outline-slate-500"
        spellCheck={true}
        ref={textareaRef}
        onKeyDown={textAreaKeyHandler}
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
            callback={saveReportHandler}
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
