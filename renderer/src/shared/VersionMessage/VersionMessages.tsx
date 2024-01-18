import { useEffect, useState } from "react";
import {
  CheckIcon,
  ExclamationCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";
import { UpdateInfo } from "electron-updater";
import { IPC_MAIN_CHANNELS } from "@electron/helpers/constants";

export default function VersionMessage() {
  const [isUpdate, setIsUpdate] = useState(false);
  const [isDownload, setIsDownload] = useState(false);
  const [version, setVersion] = useState("");
  const storedVersionData = JSON.parse(
    localStorage.getItem("version-data")
  ) || { version: "", showMessage: true };
  const [showMessage, setShowMessage] = useState(storedVersionData.showMessage);

  useEffect(() => {
    global.ipcRenderer.on(
      "update-available",
      (_, data: boolean, info: UpdateInfo) => {
        setIsUpdate(data);
        setVersion(info.version);
      }
    );
    global.ipcRenderer.on(
      "downloaded",
      (_, data: boolean, info: UpdateInfo) => {
        setIsDownload(data);
        setVersion(info.version);
      }
    );

    (async () => {
      const [updateStatus, currentVersion] = await global.ipcRenderer.invoke(
        "app:update-status"
      );

      setVersion(currentVersion);

      switch (updateStatus) {
        case "available":
          setIsUpdate(true);
          break;
        case "downloaded":
          setIsDownload(true);
          break;
      }
    })();

    return () => {
      global.ipcRenderer.removeAllListeners("update-available");
      global.ipcRenderer.removeAllListeners("downloaded");
    };
  }, []);

  useEffect(() => {
    if (version.length > 0 && version !== storedVersionData.version) {
      storedVersionData.version = version;
      storedVersionData.showMessage = true;

      localStorage.setItem("version-data", JSON.stringify(storedVersionData));
    }

    setShowMessage(storedVersionData.showMessage);
  }, [version]);

  const install = () => {
    global.ipcRenderer.send(IPC_MAIN_CHANNELS.INSTALL_VERSION);
  };

  const closeBtnHandler = () => {
    storedVersionData.showMessage = false;
    localStorage.setItem("version-data", JSON.stringify(storedVersionData));

    setShowMessage(storedVersionData.showMessage);
  };

  return (
    <div className="flex justify-center pt-2">
      <div className="flex gap-2 items-center px-2 lg:px-0">
        {isUpdate && !isDownload && showMessage && (
          <span className="flex gap-2 items-center rounded-lg px-3 py-2 bg-blue-300 text-blue-800 dark:text-blue-500 dark:bg-blue-400/30">
            <ExclamationCircleIcon className="w-6 h-6 fill-blue-400 dark:fill-blue-400/30 stroke-white bg:stroke-gray-300" />
            The version {version} is loading
          </span>
        )}
        {isDownload && showMessage && (
          <span className="relative flex gap-2 items-center rounded-lg px-12 py-3 text-sm bg-green-300 text-green-800 dark:bg-green-300/30 dark:text-green-400/70">
            <CheckIcon className="w-6 h-6 fill-green-800 dark:fill-green-400/70" />
            <p className="whitespace-normal">
              New version {version} is downloaded. Turn off the app, or click
              the Install button
            </p>
            <button
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-green-600/50 hover:dark:bg-green-600/70 focus:dark:border-focus-border focus:dark:ring-focus-border"
              onClick={install}
            >
              Install
            </button>
            <XMarkIcon
              className="w-6 h-6 fill-green-800 dark:fill-green-400/70 absolute right-1 top-1 cursor-pointer"
              onClick={closeBtnHandler}
            />
          </span>
        )}
      </div>
    </div>
  );
}
