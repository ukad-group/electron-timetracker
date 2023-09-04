import clsx from "clsx";
import { app, ipcRenderer } from "electron";
import { useState, useEffect } from "react";
import { shallow } from "zustand/shallow";
import { useUpdateStore } from "../store/updateStore";
import { useBetaStore } from "../store/betaUpdatesStore";
export default function UpdateDescription() {
  type File = {
    url: string;
    sha512: string;
    size: number;
  };

  type Release = {
    files: File[];
    path: string;
    releaseDate: string;
    releaseName: string;
    releaseNotes: string;
    sha512: string;
    tag: string;
    version: string;
  };
  const [release, setRelease] = useState<Release | null>();
  const [currentVersion, setCurrentVersion] = useState(app?.getVersion());
  const [isOpenVersion, setIsOpenVersion] = useState(false);
  const [isUpdate, setIsUpdate] = useState(false);
  const [update, setUpdate] = useUpdateStore(
    (state) => [state.update, state.setUpdate],
    shallow
  );
  const [isBeta, setIsBeta] = useBetaStore(
    (state) => [state.isBeta, state.setIsBeta],
    shallow
  );

  useEffect(() => {
    ipcRenderer.send("beta-channel", isBeta);
  }, [isBeta]);

  ipcRenderer.on("update-available", (event, data, info) => {
    setIsUpdate(data);
  });

  ipcRenderer.on("downloaded", (event, data, info) => {
    setRelease(info);
    setUpdate({ age: "new", description: info?.releaseNotes });
  });

  ipcRenderer.on("current-version", (event, data) => {
    setCurrentVersion(data);
  });

  const isUpdateToggle = () => {
    if (update.age === "old") {
      setUpdate({ age: "new", description: update.description });
    } else {
      setUpdate({ age: "old", description: update.description });
    }
  };
  return (
    <div>
      <div
        className={clsx(
          " h-16 px-4 py-5 bg-white shadow overflow-hidden transition-all ease-linear duration-300 sm:rounded-lg sm:px-6",
          {
            "h-52": update.age === "new",
          }
        )}
      >
        <div className="flex justify-between">
          <h2
            id="manual-input-title"
            className="text-lg font-medium text-gray-900"
          >
            What's new in {release?.version ? release?.version : currentVersion}{" "}
            version
          </h2>
          <button
            onClick={isUpdateToggle}
            className={clsx(
              "transform transition-transform ease-linear duration-300",
              {
                "rotate-180": update.age === "new",
              }
            )}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#000000"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>
        </div>
        <div
          className="flex flex-col gap-2 mt-3 h-32 overflow-y-auto"
          dangerouslySetInnerHTML={{ __html: update.description }}
        ></div>
      </div>
      <div className="overflow-hidden items-center left-1 flex-shrink-0 pl-2 text-xs text-gray-700 font-semibold">
        <p
          className=" cursor-pointer"
          onClick={() => setIsOpenVersion(!isOpenVersion)}
        >
          Current version {currentVersion} {!isUpdate && "(latest)"}
        </p>
        <div
          className={clsx(
            "relative flex items-start transition-all transform -my-3 -z-10 opacity-0",
            { "my-0 opacity-100 -z-0": isOpenVersion }
          )}
        >
          <div className="flex items-center h-5">
            <input
              id="comments"
              aria-describedby="comments-description"
              name="comments"
              type="checkbox"
              className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
            />
          </div>
          <div className="ml-2 text-sm">
            <label htmlFor="comments" className="font-medium text-gray-700">
              Download beta version
            </label>
            <p id="comments-description" className="text-gray-500">
              You need to restart the application
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
