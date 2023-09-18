import { ipcRenderer } from "electron";
import { useEffect, useState } from "react";

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
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="#60A4FA"
              viewBox="0 0 24 24"
              strokeWidth="1"
              stroke="white"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
              />
            </svg>
            The version {version} is loading
          </span>
        )}
        {isDownload && (
          <span className="flex gap-2 items-center rounded-lg px-3 py-2 text-sm bg-green-300 text-green-800">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="#166534"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.5 12.75l6 6 9-13.5"
              />
            </svg>
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
