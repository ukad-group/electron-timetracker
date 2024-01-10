import { ReportActivity } from "../../helpers/utils/reports";

export type ActivitiesTableProps = {
  activities: ReportActivity[];
  onEditActivity: (activity: ReportActivity) => void;
  onDeleteActivity: (id: number) => void;
  selectedDate: Date;
  latestProjAndAct: Record<string, [string]>;
  events: ReportActivity[];
  isLoading: boolean;
  showAsMain: boolean;
};