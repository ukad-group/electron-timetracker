import { ConnectionsSection } from "../components/ConnectionsSection";
import { MainInputSection } from "../components/MainInputSection";
import { ReportsFolderSection } from "../components/ReportsFolderSection";
import { ThemeSection } from "../components/ThemeSection";
import { VersionSection } from "../components/VersionSection";

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
