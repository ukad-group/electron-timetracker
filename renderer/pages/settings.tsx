import { useEffect, useState } from "react";
import Link from "next/link";
import { shallow } from "zustand/shallow";
import FolderSelector from "../components/FolderSelector";
import { useMainStore } from "../store/mainStore";
import { useThemeStore } from "../store/themeStore";
import TrelloConnection from "../components/TrelloConnection";
import Office365Connection from "../components/Office365Connection";
import GoogleConnection from "../components/GoogleConnection";
import clsx from "clsx";
import TimetrackerWebsiteConnection from "../components/TimetrackerWebsiteConncetion";
import BetaToggle from "../components/ui/BetaToggle";
import JiraConnection from "../components/JiraConnection";
import MenuItem from "../components/ui/MenuItem";
import ButtonTransparent from "../components/ui/ButtonTransparent";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";

enum SidebarNavItem {
  Connections = "Connections",
  ReportsFolder = "Reports folder",
  Theme = "Theme",
  VersionSelect = "Version",
}

const SettingsPage = () => {
  const [theme] = useThemeStore(
    (state) => [state.theme, state.setTheme],
    shallow
  );
  const [isOSDarkTheme, setIsOSDarkTheme] = useState(true);
  const [currentMenuItem, setCurrentMenuItem] = useState<SidebarNavItem>(
    SidebarNavItem.Connections
  );

  useEffect(() => {
    const mediaQueryList = window.matchMedia("(prefers-color-scheme: dark)");

    mediaQueryList.addListener(handleThemeChange);
    setIsOSDarkTheme(mediaQueryList.matches);

    const mode =
      (theme.os && isOSDarkTheme) || (!theme.os && theme.custom === "dark")
        ? "dark bg-dark-back"
        : "light bg-grey-100";

    document.body.className = mode;

    return () => {
      mediaQueryList.removeListener(handleThemeChange);
    };
  }, [theme, isOSDarkTheme]);

  function handleThemeChange(e) {
    if (e.matches) {
      setIsOSDarkTheme(true);
    } else {
      setIsOSDarkTheme(false);
    }
  }

  const getSection = () => {
    switch (currentMenuItem) {
      case SidebarNavItem.Connections:
      default:
        return <ConnectionsSection />;

      case SidebarNavItem.ReportsFolder:
        return <ReportsFolderSection />;

      case SidebarNavItem.Theme:
        return <ThemeSection />;

      case SidebarNavItem.VersionSelect:
        return <VersionSection />;
    }
  };

  return (
    <div className="w-full overflow-hidden h-screen bg-gray-100 dark:bg-dark-back">
      <div className="h-full overflow-hidden mx-auto sm:px-6 max-w-3xl lg:max-w-[1400px] flex flex-col gap-6 px-6 py-10 dark:bg-dark-back">
        <div className="h-full overflow-hidden flex flex-col gap-6 bg-white shadow sm:rounded-lg p-6 dark:bg-dark-container dark:border-dark-border">
          <div className="flex items-center justify-between gap-6">
            <div className="flex flex-col">
              <span className="text-lg font-medium text-gray-900 dark:text-dark-heading">
                Settings
              </span>
              <span className="text-sm text-gray-500 dark:text-dark-main">
                Manage your settings and set preferences
              </span>
            </div>
            <Link href="/">
              <ButtonTransparent>
                <ChevronLeftIcon className="w-5 h-5" /> Back
              </ButtonTransparent>
            </Link>
          </div>
          <div className="border dark:border-dark-form-border"></div>
          <div className="h-full overflow-hidden inline-flex flex-col lg:grid lg:grid-cols-[250px_auto] gap-6">
            <nav>
              <ul className="flex flex-wrap lg:flex-col gap-2 lg:gap-3 rounded-md p-2 lg:p-3 ">
                {Object.values(SidebarNavItem).map((value) => (
                  <li
                    key={value}
                    className="text-lg font-medium text-gray-900 dark:text-dark-heading"
                  >
                    <MenuItem
                      callback={() => setCurrentMenuItem(value)}
                      isActive={currentMenuItem === value}
                    >
                      {value}
                    </MenuItem>
                  </li>
                ))}
              </ul>
            </nav>
            <div className="h-full overflow-hidden">{getSection()}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ConnectionsSection = () => (
  <section className="h-full">
    <div className="overflow-y-auto h-full bg-white sm:rounded-lg p-2 flex flex-col gap-6 dark:bg-dark-container">
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
      <JiraConnection />
      <TimetrackerWebsiteConnection />
    </div>
  </section>
);

const ReportsFolderSection = () => {
  const [reportsFolder, setReportsFolder] = useMainStore(
    (state) => [state.reportsFolder, state.setReportsFolder],
    shallow
  );

  return (
    <section className="h-full">
      <div className="overflow-y-auto h-full bg-white sm:rounded-lg p-2 flex flex-col gap-6 dark:bg-dark-container">
        <div className="flex flex-col gap-1">
          <span className="text-lg font-medium text-gray-900 dark:text-dark-heading">
            Folder with reports
          </span>
          <div className="mt-4 max-w-3xl">
            <div className="mb-4">
              <h4 className="text-gray-900 dark:text-dark-heading mb-1">
                For UKAD Users
              </h4>
              <p className="text-sm text-gray-500 dark:text-dark-main">
                The designated folder should be created and shared with you on
                Dropbox by the UKAD DevOps team. <br /> To locate your Dropbox
                root folder, please navigate to C:\Users[Windows user]\Dropbox.{" "}
                <br /> Our application's folder structure mirrors the format
                'John Galt {">"} 2024 {">"} week 05.' <br /> Kindly select the
                'John Galt' folder as your designated storage location.
              </p>
            </div>
            <div>
              <h4 className="text-gray-900 dark:text-dark-heading mb-1">
                For other Users
              </h4>
              <p className="text-sm text-gray-500 dark:text-dark-main">
                As a Non-UKAD user, you have the flexibility to choose any
                folder of your preference for storing your reports. However, we
                strongly recommend utilizing cloud storage services like
                Dropbox, Google Drive, etc. These services facilitate seamless
                report synchronization across your devices, offer automatic
                backups, and preserve a historical record of your data.
              </p>
            </div>
          </div>
        </div>
        <div className="flex w-full items-center flex-shrink min-w-0 gap-4">
          <FolderSelector
            folderLocation={reportsFolder}
            setFolderLocation={setReportsFolder}
          />
        </div>
      </div>
    </section>
  );
};

const ThemeSection = () => {
  const [theme, setTheme] = useThemeStore(
    (state) => [state.theme, state.setTheme],
    shallow
  );

  return (
    <section className="h-full">
      <div className="overflow-y-auto h-full bg-white sm:rounded-lg p-2 flex flex-col gap-6 dark:bg-dark-container">
        <div className="flex flex-col gap-3">
          <span className="text-lg font-medium text-gray-900 dark:text-dark-heading">
            Theme
          </span>
          <div className="flex items-center">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                id="deviceTheme"
                aria-describedby="comments-description"
                defaultChecked={theme.os}
                name="deviceTheme"
                onClick={() =>
                  setTheme({ custom: theme.custom, os: !theme.os })
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 dark:peer-focus:ring-dark-button-back rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-dark-button-hover"></div>
              <span className="ml-3 text-sm font-medium text-gray-500 dark:text-dark-main">
                Use device theme
              </span>
            </label>
          </div>
          <div className="flex items-center">
            <label
              className={clsx(
                "relative inline-flex items-center cursor-pointer",
                {
                  "opacity-10 cursor-auto": theme.os,
                }
              )}
            >
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
                    "cursor-default after:bg-gray-200 after:border-gray-300 peer-checked:after:border-gray-300 dark:after:bg-gray-500 dark:after:border-gray-600 dark:peer-checked:after:border-gray-600 peer-checked:bg-gray-300 dark:peer-checked:bg-gray-600":
                      theme.os,
                  }
                )}
              ></div>
              <span
                className={clsx(
                  "ml-3 text-sm font-medium text-gray-500 dark:text-dark-main",
                  { "cursor-default": theme.os }
                )}
              >
                Toggle to {theme.custom === "light" ? "dark" : "light"} theme
              </span>
            </label>
          </div>
        </div>
      </div>
    </section>
  );
};

const VersionSection = () => (
  <section className="h-full">
    <div className="overflow-y-auto h-full bg-white sm:rounded-lg p-2 flex flex-col gap-6 dark:bg-dark-container">
      <div className="flex flex-col gap-1">
        <span className="text-lg font-medium text-gray-900 dark:text-dark-heading">
          Stable or beta version
        </span>
        <BetaToggle />
      </div>
    </div>
  </section>
);

export default SettingsPage;
