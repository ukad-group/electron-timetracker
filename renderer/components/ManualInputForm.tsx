import { SetStateAction, useEffect, useState } from "react";

type ManualInputFormProps = {
  selectedDateReport: string;
  onSave: (
    selectedDateReport: SetStateAction<string>,
    shouldAutosave: SetStateAction<boolean>
  ) => void;
};

export default function ManualInputForm({
  selectedDateReport,
  onSave,
}: ManualInputFormProps) {
  const [report, setReport] = useState("");
  const [saveBtnStatus, setSaveBtnStatus] = useState("enabled");
  const saveBtnStatuses = {
    enabled: { text: 'Save', classes: ' bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'},
    disabled: { text: 'Save', classes: ' bg-grey-600'},
    inprogress: { text: 'Saving...', classes: ' bg-blue-600'},
    done: { text: 'Saved', classes: ' bg-green-600'}
  }

  const saveOnPressHandler = (e: KeyboardEvent) => {
    if (e.code === "KeyS" && e.ctrlKey) {
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
    setSaveBtnStatus('enabled');
    setReport(selectedDateReport);
  }, [selectedDateReport]);

  const saveReportHandler = () => {
    onSave(report, true);
    setSaveBtnStatus('inprogress');
    setTimeout(() => {
      setSaveBtnStatus('done');
    }, 1000);
  }

  const changeReportHandler = (e) => {
    setSaveBtnStatus('enabled');
    setReport(e.target.value)
  }

  return (
    <div>
      <h2 id="manual-input-title" className="text-lg font-medium text-gray-900">
        Manual input
      </h2>

      <textarea
        value={report}
        onChange={(e) => changeReportHandler(e)}
        rows={10}
        className="block w-full px-3 py-2 mt-3 border border-gray-300 rounded-md shadow-sm focus-visible:outline-blue-500 sm:text-sm"
        spellCheck={false}
      />
      <div className="flex flex-col mt-6 justify-stretch">
        <button
          onClick={saveReportHandler}
          type="button"
          className={"inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white border border-transparent rounded-md shadow-sm " + saveBtnStatuses[saveBtnStatus].classes}>
          {saveBtnStatus === "inprogress" && <span className="loader mr-2"></span>}
          { saveBtnStatuses[saveBtnStatus].text }
        </button>
        <span className="block text-xs text-gray-500 text-center">
          or press ctrl + s
        </span>
      </div>
    </div>
  );
}
