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

    ipcRenderer.on("file exist", (event, data) => {
      setIsFileExist(data);
    });
  }, [selectedDate]);

  const deleteFile = () => {
    setIsFileExist(false);
    ipcRenderer
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
      // <div className="flex justify-center pt-2">
      //   <div className="flex gap-2 items-center flex-shrink-0 px-2 lg:px-0">
      //     {!selectedDateReport && isFileExist && (
      //       <span className="flex gap-2 items-center rounded-lg px-3 py-2 text-sm bg-yellow-100 border-2 border-yellow-300 text-yellow-800">
      //         <ExclamationTriangleIcon className="w-6 h-6 fill-yellow-500" />
      //         <p className="whitespace-normal">
      //           The file is devoid of content or entries. Do you want to delete
      //           it?
      //         </p>
      //         <button
      //           className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-red-500 border border-transparent rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      //           onClick={deleteFile}
      //         >
      //           Delete
      //         </button>
      //       </span>
      //     )}
      //   </div>
      // </div>
      // <div
      //   id="popover"
      //   className="relative w-11/12 transition duration-150 ease-in-out mx-auto -mt-[76px] -top-2 left-0"
      // >
      //   <div className="w-full rounded-lg  text-sm bg-yellow-100 border-2 border-yellow-200 text-yellow-800  shadow-2xl">
      //     <div className="relative rounded-t py-4 px-4 flex justify-center">
      //       <svg
      //         className="absolute -mb-6 transform -rotate-90  bottom-0"
      //         width="30px"
      //         height="30px"
      //         viewBox="0 0 9 16"
      //         version="1.1"
      //         xmlns="http://www.w3.org/2000/svg"
      //         xmlnsXlink="http://www.w3.org/1999/xlink"
      //       >
      //         <g
      //           id="Page-1"
      //           stroke="none"
      //           strokeWidth={1}
      //           fill="none"
      //           fillRule="evenodd"
      //         >
      //           <g
      //             id="Tooltips-"
      //             transform="translate(-874.000000, -1029.000000)"
      //             fill="rgb(254 249 195)"
      //           >
      //             <g
      //               id="Group-3-Copy-16"
      //               transform="translate(850.000000, 975.000000)"
      //             >
      //               <g id="Group-2" transform="translate(24.000000, 0.000000)">
      //                 <polygon
      //                   id="Triangle"
      //                   transform="translate(4.500000, 62.000000) rotate(-90.000000) translate(-4.500000, -62.000000) "
      //                   points="4.5 57.5 12.5 66.5 -3.5 66.5"
      //                 />
      //               </g>
      //             </g>
      //           </g>
      //         </g>
      //       </svg>
      //       <span className="flex gap-2 ">
      //         <p className="whitespace-normal">
      //           The file is devoid of content or entries. Do you want to delete
      //           it?
      //         </p>
      //         <button
      //           className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-red-400 border border-transparent rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      //           onClick={deleteFile}
      //         >
      //           Delete
      //         </button>
      //       </span>
      //     </div>
      //   </div>
      // </div>

      <div className="absolute animate-[scaling_1s_ease-in-out_forwards] overflow-hidden rounded-lg bg-white text-left shadow-2xl left-[5%] bottom-24 sm:w-[90%]">
        <div className="bg-white px-4 pb-4 pt-5 sm:p-4 sm:pr-6">
          <div className="sm:flex sm:items-start">
            <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
              <svg
                className="h-6 w-6 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
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
