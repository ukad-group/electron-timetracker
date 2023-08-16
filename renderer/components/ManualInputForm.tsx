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

  const saveOnPressHandler = (e: KeyboardEvent) => {
    if (e.code === "KeyS" && e.ctrlKey) {
      onSave(report, true);
    }
  };

  useEffect(() => {
    document.addEventListener("keydown", saveOnPressHandler);
    return () => {
      document.removeEventListener("keydown", saveOnPressHandler);
    };
  }, [report]);

  useEffect(() => {
    setReport(selectedDateReport);
  }, [selectedDateReport]);

  return (
    <div>
      <h2 id="manual-input-title" className="text-lg font-medium text-gray-900">
        Manual input
      </h2>

      <textarea
        value={report}
        onChange={(e) => setReport(e.target.value)}
        rows={10}
        className="block w-full px-3 py-2 mt-3 border border-gray-300 rounded-md shadow-sm focus-visible:outline-blue-500 sm:text-sm"
        spellCheck={false}
      />
      <div className="flex flex-col mt-6 justify-stretch">
        <button
          onClick={() => onSave(report, true)}
          type="button"
          className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
          Save
        </button>
        <span className="block text-xs text-gray-500 text-center">
          or press ctrl + s
        </span>
      </div>
    </div>
  );
}
