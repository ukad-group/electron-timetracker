import { SetStateAction, useEffect, useState, useRef } from "react";
import Button from "./ui/Button";
import DeleteMessage from "./ui/DeleteMessage";
import { parseReport, serializeReport } from "../utils/reports";
import { getCurrentTimeRoundedUp } from "../utils/datetime-ui";
import useUndoManager from "../hooks/useUndoManager";

type ManualInputFormProps = {
  selectedDateReport: string;
  onSave: (
    selectedDateReport: SetStateAction<string>,
    shouldAutosave: SetStateAction<boolean>
  ) => void;
  selectedDate: Date;
};

export default function ManualInputForm({
  selectedDateReport,
  onSave,
  selectedDate,
}: ManualInputFormProps) {
  const [report, setReport] = useState("");
  const [saveBtnStatus, setSaveBtnStatus] = useState("disabled");
  const textareaRef = useRef(null);
  const undoManager = useUndoManager(report);

  const saveOnPressHandler = (e: KeyboardEvent) => {
    if (
      (e.ctrlKey || e.metaKey) &&
      e.code === "KeyS" &&
      saveBtnStatus === "enabled"
    ) {
      saveReportHandler();
    }
  };

  useEffect(() => {
    undoManager.setValue(report);
    setReportHandler(report);
    document.addEventListener("keydown", saveOnPressHandler);
    return () => {
      document.removeEventListener("keydown", saveOnPressHandler);
    };
  }, [report]);

  useEffect(() => {
    setReportHandler(selectedDateReport);
  }, [selectedDateReport]);

  const saveReportHandler = () => {
    global.ipcRenderer.send("send-analytics-data", "manuall_save");
    onSave(report, true);
    setSaveBtnStatus("inprogress");
  };

  const setReportHandler = (report: string) => {
    if (selectedDateReport !== report) {
      setSaveBtnStatus("enabled");
    }

    if (!report || selectedDateReport === report) {
      setSaveBtnStatus("disabled");
    }

    setReport(report);
  };

  const textAreaKeyHandler = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.code === "KeyD") {
      e.preventDefault();
      copyCurrentLine();
    }

    if ((e.ctrlKey || e.metaKey) && e.code === "KeyZ") {
      e.preventDefault();
      const currentValue = undoManager.undo();
      if (typeof currentValue === "string") {
        setReport(currentValue);
      }
    }

    if ((e.ctrlKey || e.metaKey) && e.code === "KeyY") {
      e.preventDefault();
      const currentValue = undoManager.redo();
      if (typeof currentValue === "string") {
        setReport(currentValue);
      }
    }
  };

  const getCurrentCursorLineValue = (
    textarea: HTMLTextAreaElement,
    report: string
  ) => {
    const cursorPosition = textarea.selectionStart;
    const currentLineStart = report.lastIndexOf("\n", cursorPosition - 1) + 1;
    const currentLineEnd = report.indexOf("\n", cursorPosition);
    const currentLine = report.slice(
      currentLineStart,
      currentLineEnd !== -1 ? currentLineEnd : undefined
    );

    return currentLine;
  };

  const copyCurrentLine = () => {
    const textarea = textareaRef.current;
    const reportAndNotes = parseReport(report);
    const activities = reportAndNotes[0] || [];
    const lastActivity = activities[activities.length - 1];

    if (textarea) {
      const currentLineValue = getCurrentCursorLineValue(textarea, report);
      const isCursorOnRegistration =
        parseReport(currentLineValue)[0]?.length !== 0;

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
      (!reportAndNotes[1] || reportAndNotes[1].startsWith("undefined")
        ? ""
        : reportAndNotes[1]);

    setReportHandler(serializedReport);
  };

  return (
    <div>
      <h2
        id="manual-input-title"
        className="text-lg font-medium text-gray-900 dark:text-dark-heading"
      >
        Manual input
      </h2>

      <textarea
        value={report}
        onChange={(e) => setReportHandler(e.target.value)}
        rows={10}
        className="block w-full px-3 py-2 mt-3 border border-gray-300 rounded-md shadow-sm focus-visible:outline-blue-500 sm:text-sm dark:bg-dark-back dark:border-dark-border dark:text-slate-400 focus-visible:dark:outline-slate-500"
        spellCheck={true}
        ref={textareaRef}
        onKeyDown={textAreaKeyHandler}
      />
      <div className="relative flex flex-col mt-6 justify-stretch">
        <DeleteMessage
          selectedDateReport={selectedDateReport}
          selectedDate={selectedDate}
        />
        <Button
          text="Save"
          callback={saveReportHandler}
          status={saveBtnStatus}
          disabled={saveBtnStatus === "disabled"}
          type={"button"}
        />
        <span className="block text-xs text-gray-500 text-center">
          or press ctrl + s
        </span>
      </div>
    </div>
  );
}
