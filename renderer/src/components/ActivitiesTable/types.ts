import { ReportActivity } from "@/helpers/utils/reports";

export type ActivitiesTableProps = {
  activities: ReportActivity[];
  onEditActivity: (activity: ReportActivity) => void;
  onDeleteActivity: (id: number) => void;
  selectedDate: Date;
  latestProjAndAct: Record<string, [string]>;
  events: ReportActivity[];
  isLoading: boolean;
  showAsMain: boolean;
  validatedActivities: ReportActivity[];
};

export interface Activity {
  id: number | null;
  from: string;
  to: string;
  duration: number;
  validation: {
    isValid: boolean;
    cell: string;
    description: string;
  };
  calendarId: string;
  project: string;
  isValid?: boolean;
  isNewProject?: boolean;
  isBreak?: boolean;
  activity: Activity;
  mistakes: [string];
  description: string;
}
