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
  SHOW_GOOGLE_EVENTS: 'showGoogleEvents',
  SHOW_OFFICE_365_EVENTS: 'showOffice365Events',
  TIMETRACKER_USER: 'timetracker-user',
  GOOGLE_USERS: 'googleUsers'
  // ...Add more local storage variables as needed
}

export const KEY_CODES = {
  SPACE: 'Space',
  ARROW_UP: 'ArrowUp',
  META: 'Meta',
  CONTROL: 'Control'
  // ...Add more key codes as needed
}
