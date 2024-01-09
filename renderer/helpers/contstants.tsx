import { ConnectionsSection } from "../components/ConnectionsSection";
import { ReportsFolderSection } from "../components/ReportsFolderSection";
import { ThemeSection } from "../components/ThemeSection";
import { VersionSection } from "../components/VersionSection";

export enum SidebarNavItem {
  Connections = "Connections",
  ReportsFolder = "Reports folder",
  Theme = "Theme",
  VersionSelect = "Version",
}

export const SETTING_SECTIONS = {
  [SidebarNavItem.Connections]: <ConnectionsSection />,
  [SidebarNavItem.ReportsFolder]: <ReportsFolderSection />,
  [SidebarNavItem.Theme]: <ThemeSection />,
  [SidebarNavItem.VersionSelect]: <VersionSection />
};