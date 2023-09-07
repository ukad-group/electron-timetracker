import { app, ipcRenderer } from "electron";
import { useEffect, useState } from "react";
import { CheckIcon, ExclamationCircleIcon } from "@heroicons/react/24/solid";

export default function VersionMessage() {
  const [isUpdate, setIsUpdate] = useState(false);
  const [isDownload, setIsDownload] = useState(false);
  const [version, setVersion] = useState("");

  useEffect(() => {
    ipcRenderer.send("start-update-watcher");
    ipcRenderer.on("update-available", (event, data, info) => {
      setIsUpdate(data);
      setVersion(info.version);
    });
    ipcRenderer.on("downloaded", (event, data, info) => {
      setIsDownload(data);
      setVersion(info.version);
    });
  }, []);

  const install = () => {
    ipcRenderer.send("install");
  };
  return (
    <div className="flex justify-center pt-2">
      <div className="flex gap-2 items-center flex-shrink-0 px-2 lg:px-0">
        {isUpdate && !isDownload && (
          <span className="flex gap-2 items-center rounded-lg px-3 py-2 bg-blue-300 text-blue-800">
            <ExclamationCircleIcon className="w-6 h-6 fill-blue-400 stroke-white" />
            The version {version} is loading
          </span>
        )}
        {isDownload && (
          <span className="flex gap-2 items-center rounded-lg px-3 py-2 text-sm bg-green-300 text-green-800">
            <CheckIcon className="w-6 h-6 fill-green-800" />
            <p className="whitespace-normal">
              New version {version} is downloaded. Turn off the app, or click
              the Install button
            </p>
            <button
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              onClick={install}
            >
              Install
            </button>
          </span>
        )}
      </div>
    </div>
  );
}
