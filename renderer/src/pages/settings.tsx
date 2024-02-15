import { useEffect, useState } from "react";
import Link from "next/link";
import { MenuItem } from "@/shared/MenuItem";
import { ButtonTransparent } from "@/shared/ButtonTransparent";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";
import { SidebarNavItem, SETTING_SECTIONS, LOCAL_STORAGE_VARIABLES } from "@/helpers/contstants";
import { extractTokenFromString } from "@/helpers/utils/utils";
import { IPC_MAIN_CHANNELS } from "@electron/helpers/constants";

const SettingsPage = () => {
  const [currentMenuItem, setCurrentMenuItem] = useState<SidebarNavItem>(SidebarNavItem.Connections);

  const settingSection = SETTING_SECTIONS[currentMenuItem];

  const closeWindowIfNeeded = () => {
    const urlParams = new URLSearchParams(window.location.search);

    if (window.location.hash || window.location.search) {
      if (
        window.location.search.includes("code") &&
        window.location.search.includes("state=office365code") &&
        !window.location.search.includes("error")
      ) {
        localStorage.setItem(LOCAL_STORAGE_VARIABLES.OFFICE_365_AUTH_CODE, urlParams.get("code"));
        global.ipcRenderer.send(IPC_MAIN_CHANNELS.CHILD_WINDOW_CLOSED, "office365");
      }

      if (
        window.location.search.includes("code") &&
        window.location.search.includes("state=jiracode") &&
        !window.location.search.includes("error")
      ) {
        localStorage.setItem(LOCAL_STORAGE_VARIABLES.JIRA_AUTH_CODE, urlParams.get("code"));
        global.ipcRenderer.send(IPC_MAIN_CHANNELS.CHILD_WINDOW_CLOSED, "jira");
      }

      if (
        window.location.search.includes("code") &&
        window.location.search.includes("state=googlecalendarcode") &&
        !window.location.search.includes("error")
      ) {
        localStorage.setItem(LOCAL_STORAGE_VARIABLES.GOOGLE_AUTH_CODE, urlParams.get("code"));
        global.ipcRenderer.send(IPC_MAIN_CHANNELS.CHILD_WINDOW_CLOSED, "google");
      }

      if (window.location.hash.includes("token") && !window.location.hash.includes("error")) {
        const tokenFromUrl = extractTokenFromString(window.location.hash);

        localStorage.setItem(LOCAL_STORAGE_VARIABLES.TRELLO_AUTH_TOKEN, tokenFromUrl);
        global.ipcRenderer.send(IPC_MAIN_CHANNELS.CHILD_WINDOW_CLOSED, "trello");
      }

      if (window.location.search.includes("code") && window.location.search.includes("state=azure-base")) {
        localStorage.setItem(LOCAL_STORAGE_VARIABLES.TIMETRACKER_WEBSITE_CODE, urlParams.get("code"));
        global.ipcRenderer.send(IPC_MAIN_CHANNELS.CHILD_WINDOW_CLOSED, "timetracker-website");
      }

      if (window.location.search.includes("code") && window.location.search.includes("state=azure-additional")) {
        return;
      }

      window.close();
    }
  };

  useEffect(() => {
    closeWindowIfNeeded();
  }, []);

  const renderSidebarNavItems = () =>
    Object.values(SidebarNavItem).map((value) => (
      <li key={value} className="text-lg font-medium text-gray-900 dark:text-dark-heading">
        <MenuItem callback={() => setCurrentMenuItem(value)} isActive={currentMenuItem === value}>
          {value}
        </MenuItem>
      </li>
    ));

  return (
    <div className="w-full overflow-hidden h-screen bg-gray-100 dark:bg-dark-back">
      <div className="h-full overflow-hidden mx-auto sm:px-6 max-w-3xl lg:max-w-[1400px] flex flex-col gap-6 px-6 py-10 dark:bg-dark-back">
        <div className="h-full overflow-hidden flex flex-col gap-6 bg-white shadow sm:rounded-lg p-6 dark:bg-dark-container dark:border-dark-border">
          <div className="flex items-center justify-between gap-6">
            <div className="flex flex-col">
              <span className="text-lg font-medium text-gray-900 dark:text-dark-heading">Settings</span>
              <span className="text-sm text-gray-500 dark:text-dark-main">
                Manage your settings and set preferences
              </span>
            </div>
            <Link href="/">
              <ButtonTransparent>
                <ChevronLeftIcon className="w-4 h-4" /> Back
              </ButtonTransparent>
            </Link>
          </div>
          <div className="border dark:border-dark-form-border"></div>
          <div className="h-full overflow-hidden inline-flex flex-col lg:grid lg:grid-cols-[250px_auto] gap-6">
            <nav>
              <ul className="flex flex-wrap lg:flex-col gap-2 lg:gap-3 rounded-md p-2 lg:p-3 ">
                {renderSidebarNavItems()}
              </ul>
            </nav>
            <div className="h-full overflow-hidden">{settingSection}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
