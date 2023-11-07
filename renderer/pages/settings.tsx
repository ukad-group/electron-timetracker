import { useEffect, useState } from "react";
import Link from "next/link";
import { shallow } from "zustand/shallow";
import { XMarkIcon } from "@heroicons/react/24/solid";
import FolderSelector from "../components/FolderSelector";
import { useMainStore } from "../store/mainStore";
import { useThemeStore } from "../store/themeStore";
import TrelloConnection from "../components/TrelloConnection";
import Office365Connection from "../components/Office365Connection";
import GoogleConnection from "../components/GoogleConnection";
import clsx from "clsx";

const SettingsPage = () => {
  const [reportsFolder, setReportsFolder] = useMainStore(
    (state) => [state.reportsFolder, state.setReportsFolder],
    shallow
  );
  const [theme, setTheme] = useThemeStore(
    (state) => [state.theme, state.setTheme],
    shallow
  );
  const [isOSDarkTheme, setIsOSDarkTheme] = useState(true);
  function handleThemeChange(e) {
    if (e.matches) {
      setIsOSDarkTheme(true);
    } else {
      setIsOSDarkTheme(false);
    }
  }

  useEffect(() => {
    window
      .matchMedia("(prefers-color-scheme: dark)")
      .addListener(handleThemeChange);

    const mode =
      (theme.os && isOSDarkTheme) || theme.custom === "dark" ? "dark" : "light";

    document.body.className = mode;
  }, [theme, isOSDarkTheme]);

  return (
    <div className="h-full w-full dark:bg-dark-back">
      <div className="mx-auto sm:px-6 max-w-3xl flex flex-col gap-6 px-6 py-10 dark:bg-dark-back">
        <section>
          <div className="bg-white shadow sm:rounded-lg p-6 flex items-center justify-between dark:bg-dark-container  dark:border-dark-border">
            <span className="text-lg font-medium text-gray-900 dark:text-dark-heading">
              Settings
            </span>
            <Link href="/">
              <div className="flex justify-end items-center flex-shrink min-w-0 gap-4">
                <XMarkIcon
                  className="w-6 h-6 cursor-pointer dark:text-dark-main"
                  aria-hidden="true"
                />
              </div>
            </Link>
          </div>
        </section>
        <section>
          <div className="bg-white shadow sm:rounded-lg p-6 flex flex-col gap-6 dark:bg-dark-container  dark:border-dark-border">
            <div className="flex flex-col gap-1">
              <span className="text-lg font-medium text-gray-900 dark:text-dark-heading">
                Folder with reports
              </span>
              <p className="text-sm text-gray-500 dark:text-dark-main">
                Specify the path on your computer where your reports will be
                saved
              </p>
            </div>
            <div className="flex w-full items-center flex-shrink min-w-0 gap-4">
              <FolderSelector
                folderLocation={reportsFolder}
                setFolderLocation={setReportsFolder}
              />
            </div>
          </div>
        </section>
        <section>
          <div className="bg-white shadow sm:rounded-lg p-6 flex flex-col gap-6 dark:bg-dark-container  dark:border-dark-border">
            <div className="flex flex-col gap-1">
              <span className="text-lg font-medium text-gray-900 dark:text-dark-heading">
                Theme
              </span>
              <div className="flex items-center mb-2">
                <input
                  type="checkbox"
                  id="deviceTheme"
                  aria-describedby="comments-description"
                  defaultChecked={theme.os}
                  name="deviceTheme"
                  onClick={() =>
                    setTheme({ custom: theme.custom, os: !theme.os })
                  }
                  className="w-5 mr-7 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-0 dark:bg-gray-700 dark:border-gray-600"
                />
                <label
                  htmlFor="deviceTheme"
                  className="ml-2 text-sm font-medium text-gray-500 dark:text-dark-main"
                >
                  Use device theme
                </label>
              </div>
              <div className="flex items-center">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    value=""
                    defaultChecked={theme.custom === "dark"}
                    disabled={theme.os}
                    onClick={() =>
                      setTheme({
                        custom: theme.custom === "light" ? "dark" : "light",
                        os: theme.os,
                      })
                    }
                    className="sr-only peer"
                  />
                  <div
                    className={clsx(
                      "w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 dark:peer-focus:ring-dark-button-back rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-dark-button-hover",
                      {
                        "after:bg-gray-200 after:border-gray-300 peer-checked:after:border-gray-300 dark:after:bg-gray-500 dark:after:border-gray-600 dark:peer-checked:after:border-gray-600 peer-checked:bg-gray-300 dark:peer-checked:bg-gray-600":
                          theme.os,
                      }
                    )}
                  ></div>
                  <span className="ml-3 text-sm font-medium text-gray-500 dark:text-dark-main">
                    Toggle to {theme.custom === "light" ? "dark" : "light"}{" "}
                    theme
                  </span>
                </label>
              </div>
            </div>
          </div>
        </section>
        <section>
          <div className="bg-white shadow sm:rounded-lg p-6 flex flex-col gap-6 dark:bg-dark-container  dark:border-dark-border">
            <div className="flex flex-col gap-1">
              <span className="text-lg font-medium text-gray-900 dark:text-dark-heading">
                Connections
              </span>
              <p className="text-sm text-gray-500">
                You can connect available resources to use their capabilities to
                complete your reports
              </p>
            </div>
            <TrelloConnection />
            <GoogleConnection />
            <Office365Connection />
          </div>
        </section>
      </div>
    </div>
  );
};

export default SettingsPage;
