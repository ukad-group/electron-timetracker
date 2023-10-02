import clsx from "clsx";
import { ipcRenderer } from "electron";
import { useEffect, useState } from "react";
import { shallow } from "zustand/shallow";
import { useMainStore } from "../../store/mainStore";
import { ExclamationTriangleIcon } from "@heroicons/react/24/solid";

type DeleteMessageProps = {
  selectedDateReport: string;
  selectedDate: Date;
};

export default function DeleteMessage({
  selectedDateReport,
  selectedDate,
}: DeleteMessageProps) {
  const [reportsFolder, setReportsFolder] = useMainStore(
    (state) => [state.reportsFolder, state.setReportsFolder],
    shallow
  );
  const [isCanceledDays, setIsCanceledDays] = useState<Record<string, boolean>>(
    {}
  );
  const [isFileExist, setIsFileExist] = useState(false);
  useEffect(() => {
    setIsFileExist(false);

    global.ipcRenderer.on("file exist", (event, data) => {
      setIsFileExist(data);
    });
  }, [selectedDate]);

  const deleteFile = () => {
    setIsFileExist(false);
    global.ipcRenderer
      .invoke("app:delete-file", reportsFolder, selectedDate)
      .then((success) => {
        if (!success) {
          console.log("File deleting error.");
        }
      })
      .catch((error) => {
        console.error("Error deleting file:", error);
      });
  };
  const cancel = () => {
    setIsFileExist(false);
    setIsCanceledDays((canceled) => {
      canceled[selectedDate.toDateString()] = true;
      return canceled;
    });
  };
  if (
    !selectedDateReport &&
    isFileExist &&
    !isCanceledDays[selectedDate.toDateString()]
  ) {
    return (
      <div className="absolute animate-[scaling_1s_ease-in-out_forwards] overflow-hidden rounded-lg bg-white text-left shadow-2xl left-[5%] bottom-24 sm:w-[90%]">
        <div className="bg-white px-4 pb-4 pt-5 sm:p-4 sm:pr-6">
          <div className="sm:flex sm:items-start">
            <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
              <svg
                className="h-6 w-6 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                />
              </svg>
            </div>
            <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
              <h3
                className="text-base font-semibold leading-6 text-gray-900"
                id="modal-title"
              >
                Empty file
              </h3>
              <div className="mt-2">
                <p className="text-sm text-gray-500">
                  The file is devoid of content or entries.
                  <br />
                  Do you want to delete it?
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-gray-50 px-4 py-2 sm:flex sm:flex-row-reverse sm:px-6">
          <button
            onClick={deleteFile}
            type="button"
            className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto"
          >
            Delete
          </button>
          <button
            onClick={cancel}
            type="button"
            className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }
}