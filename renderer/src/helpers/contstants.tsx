import { ConnectionsSection } from "@/components/ConnectionsSection";
import { MainInputSection } from "@/components/MainInputSection";
import { ReportsFolderSection } from "@/components/ReportsFolderSection";
import { ThemeSection } from "@/components/ThemeSection";
import { VersionSection } from "@/components/VersionSection";

export enum SidebarNavItem {
  Connections = "Connections",
  ReportsFolder = "Reports folder",
  Theme = "Theme",
  VersionSelect = "Version",
  MainInputSelect = "Main input",
}

export const SETTING_SECTIONS = {
  [SidebarNavItem.Connections]: <ConnectionsSection />,
  [SidebarNavItem.ReportsFolder]: <ReportsFolderSection />,
  [SidebarNavItem.Theme]: <ThemeSection />,
  [SidebarNavItem.VersionSelect]: <VersionSection />,
  [SidebarNavItem.MainInputSelect]: <MainInputSection />,
};

export const LOCAL_STORAGE_VARIABLES = {
  SHOW_GOOGLE_EVENTS: "showGoogleEvents",
  SHOW_OFFICE_365_EVENTS: "showOffice365Events",
  TIMETRACKER_USER: "timetracker-user",
  TIMETRACKER_WEBSITE_CODE: "timetracker-website-code",
  GOOGLE_USERS: "googleUsers",
  GOOGLE_AUTH_CODE: "google-auth-code",
  JIRA_USERS: "jira-users",
  JIRA_AUTH_CODE: "jira-auth-code",
  OFFICE_365_USERS: "office365-users",
  OFFICE_365_AUTH_CODE: "office365-auth-code",
  TRELLO_USER: "trello-user",
  TRELLO_AUTH_TOKEN: "trello-auth-token",
  // ...Add more local storage variables as needed
};

export const KEY_CODES = {
  SPACE: "Space",
  ARROW_UP: "ArrowUp",
  META: "Meta",
  CONTROL: "Control",
  // ...Add more key codes as needed
};
