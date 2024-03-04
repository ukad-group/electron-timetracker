import { ReportActivity } from "../../helpers/utils/reports";

export type ActivitiesTableProps = {
  activities: ReportActivity[];
  onEditActivity: (activity: ReportActivity) => void;
  selectedDate: Date;
  latestProjAndAct: Record<string, [string]>;
  events: ReportActivity[];
  isLoading: boolean;
  validatedActivities: ReportActivity[];
};
