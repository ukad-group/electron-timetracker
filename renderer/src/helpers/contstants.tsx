import { ConnectionsSection } from "@/components/ConnectionsSection";
import { HelpSection } from "@/components/HelpSection";
import { MainInputSection } from "@/components/MainInputSection";
import { ReportsFolderSection } from "@/components/ReportsFolderSection";
import { ThemeSection } from "@/components/ThemeSection";
import { VersionSection } from "@/components/VersionSection";

export enum SidebarNavItem {
  Connections = "Connections",
  Help = "Help",
  ReportsFolder = "Reports folder",
  Theme = "Theme",
  VersionSelect = "Version",
  MainInputSelect = "Main input",
}

export const SETTING_SECTIONS = {
  [SidebarNavItem.Connections]: <ConnectionsSection />,
  [SidebarNavItem.Help]: <HelpSection />,
  [SidebarNavItem.ReportsFolder]: <ReportsFolderSection />,
  [SidebarNavItem.Theme]: <ThemeSection />,
  [SidebarNavItem.VersionSelect]: <VersionSection />,
  [SidebarNavItem.MainInputSelect]: <MainInputSection />,
};

export const LOCAL_STORAGE_VARIABLES = {
  SHOW_GOOGLE_EVENTS: "showGoogleEvents",
  SHOW_OFFICE_365_EVENTS: "showOffice365Events",
  TIMETRACKER_USER: "timetracker-user",
  GOOGLE_USERS: "googleUsers",
  JIRA_USERS: "jira-users",
  OFFICE_365_USERS: "office365-users",
  TIMETRACKER_WEBSITE_CODE: "timetracker-website-code",
  GOOGLE_AUTH_CODE: "google-auth-code",
  JIRA_AUTH_CODE: "jira-auth-code",
  OFFICE_365_AUTH_CODE: "office365-auth-code",
  TRELLO_USER: "trello-user",
  TRELLO_AUTH_TOKEN: "trello-auth-token",
  // ...Add more local storage variables as needed
};

export const KEY_CODES = {
  SPACE: "Space",
  ARROW_UP: "ArrowUp",
  ARROW_DOWN: "ArrowDown",
  META: "Meta",
  CONTROL: "Control",
  TAB: "Tab",
  // ...Add more key codes as needed
};

export const HINTS_GROUP_NAMES = {
  SHORTCUTS_EDITING: "shortcutsEditing",
  COPY_BUTTON: "copyButton",
  ONLINE_CALENDAR_EVENT: "calendarEvent",
  EDITING_BUTTON: "editButton",
  VALIDATION: "validation",
  PLACEHOLDER: "placeholder",
  CALENDAR: "calendar",
  MANUAL_INPUT: "manualInput",
  TOTALS: "totals",
  TRACK_TIME_MODAL: "trackTimeModal",
  WHATS_NEW: "whatsNew",
};

export const HINTS_ALERTS = {
  PLACEHOLDER_BUTTON:
    "This is a daily placeholder you'll encounter each day. Click the 'New Activity' button or press ctrl/command + space to open the form for your initial entry today. Alternatively, you can duplicate your last report by clicking 'Copy Last Report.'",
  SHORTCUTS_EDITING:
    "Simplify edits using shortcuts. Press ctrl/command to reveal numbers of each registration. Then select the registration to edit by pressing its corresponding number. Alternatively, use ArrowUp to edit the last entry.",
  EDITING_BUTTON: "If you need to modify a registration, click this button to open the corresponding form",
  COPY_BUTTON:
    "It seems that you've added a time registration similar to an existing one. Next time, you can do this in just a few clicks: simply click the 'Copy' button and save the copied time registration.",
  VALIDATION: " If you make a mistake in creating a registration, it will be displayed in red in the table",
  ONLINE_CALENDAR_EVENT:
    "The table also displays the events specified in your calendar (Google Calendar and Office 365 Calendar). If you write the title of the event in the calendar in the form of project - activity - description or activity - description, it will be parsed automatically. If the title is not separated by dashes, the entire title will be written in the description. And if there is a known project in the title, it will be written in the project field.",
  CALENDAR:
    "Within the calendar, you can easily track the time you've reported for each day. It provides visibility into your vacation days, sick leave, and holidays, along with identifying reports containing errors. The current day is highlighted in yellow, while the day you've selected for viewing is marked in blue.",
  CALENDAR_TOTALS:
    "In the totals field, you can view the cumulative hours you've reported for this month. The Required field displays the necessary number of hours to be reported for the month, factoring in weekends, holidays, vacations, and sick days (If you have connected the timetracker website in the settings).",
  CALENDAR_WEEKS: "This indicates the week number along with the total hours you've reported for that week.",
  MANUAL_INPUT:
    "In the 'Manual Input', your report is displayed in plain text, as it is stored in a file. You can directly edit your report here and save the changes using the 'Save' button or by pressing Ctrl + Space. Life hack: You can increase the height of this box by dragging it from the bottom right corner.",
  TOTALS:
    "This widget facilitates the seamless transfer of your reports to the customer's tracker. You can easily copy all your actions for the day onto the project collectively or individually in the 'activity - description' format (if there is activity) or simply the 'description' format (if there is no activity). Just click on the file icon to initiate this process. If you require the time spent on each activity, click on the plus file icon, and the log will be copied in the format 'description (hh:mm).'",
  TOTALS_PERIOD: "You can get data for the day, week and month by selecting the appropriate item in the selector",
  MODAL_TIME_FIELD:
    "You can manually modify the time by 15-minute increments using the arrow keys. Alternatively, entering the desired duration will automatically adjust the 'to' field accordingly.",
  MODAL_TEXT_FIELD:
    "In the text fields, you'll find suggestions for projects, activities, and descriptions based on your usage in the past month. Upon linking the timetracker website, all company projects become available for selection. After connecting Trello and Jira, you'll be prompted to choose tasks from your boards in the description field, prioritizing those assigned to you.",
  WHATS_NEW:
    "Here you can see your application version. Links to contact us. And the list of changes that were added in this version.",
};

export const TRACK_CONNECTIONS = {
  TIMETRACKER_WEB: "timetrackerWeb",
  GOOGLE_CALENDAR: "google-calendar",
  JIRA: "jira",
  OFFICE365_CALENDAR: "office365-calendar",
  TRELLO: "trello",
};
