import { SetStateAction, useEffect, useState } from "react";
import Button from "./ui/Button";
import DeleteMessage from "./ui/DeleteMessage";

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

  const saveOnPressHandler = (e: KeyboardEvent) => {
    if (e.code === "KeyS" && e.ctrlKey && saveBtnStatus === "enabled") {
      saveReportHandler();
    }
  };

  useEffect(() => {
    document.addEventListener("keydown", saveOnPressHandler);
    return () => {
      document.removeEventListener("keydown", saveOnPressHandler);
    };
  }, [report]);

  useEffect(() => {
    setReportHandler(selectedDateReport);
  }, [selectedDateReport]);

  useEffect(() => {
    setSaveBtnStatus("disabled");
  }, []);

  const saveReportHandler = () => {
    global.ipcRenderer.send("send-analytics-data", "manuall_save");
    onSave(report, true);
    setSaveBtnStatus("inprogress");
    setTimeout(() => {
      setSaveBtnStatus("disabled");
    }, 800);
  };

  const setReportHandler = (report) => {
    if (saveBtnStatus === "disabled") {
      setSaveBtnStatus("enabled");
    }

    if (!report || selectedDateReport === report) {
      setSaveBtnStatus("disabled");
    }

    setReport(report);
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
        spellCheck={false}
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
