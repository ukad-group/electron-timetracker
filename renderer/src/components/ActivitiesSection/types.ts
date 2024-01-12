import { ReportActivity } from "@/helpers/utils/reports";
import { Dispatch, SetStateAction } from "react";

export type TrackTimeButtonProps = {
  onEditActivity: (activity: ReportActivity | "new") => void;
}

export type ActivitiesSectionProps = TrackTimeButtonProps & {
  activities: Array<ReportActivity>;
  onDeleteActivity: (id: number) => void;
  selectedDate: Date;
  latestProjAndAct: Record<string, [string]>;
  setSelectedDateReport: Dispatch<SetStateAction<String>>;
  showAsMain: boolean;
};

export type PlaceholderProps = TrackTimeButtonProps & {
  backgroundError: string;
  selectedDate: Date;
  setSelectedDateReport: Dispatch<SetStateAction<String>>;
};