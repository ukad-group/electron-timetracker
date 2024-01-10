import { ReportActivity } from "../../helpers/utils/reports";
import { Dispatch, SetStateAction } from "react";

export type ActivitiesSectionProps = {
  activities: Array<ReportActivity>;
  onEditActivity: (activity: ReportActivity | "new") => void;
  onDeleteActivity: (id: number) => void;
  selectedDate: Date;
  latestProjAndAct: Record<string, [string]>;
  setSelectedDateReport: Dispatch<SetStateAction<String>>;
  showAsMain: boolean;
};

export type PlaceholderProps = {
  onEditActivity: (activity: ReportActivity | "new") => void;
  backgroundError: string;
  selectedDate: Date;
  setSelectedDateReport: Dispatch<SetStateAction<String>>;
};