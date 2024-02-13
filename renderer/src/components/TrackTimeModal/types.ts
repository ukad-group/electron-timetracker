import { ReportActivity } from "@/helpers/utils/reports";

export type TrackTimeModalProps = {
  activities: Array<ReportActivity> | null;
  isOpen: boolean;
  editedActivity: ReportActivity | "new";
  latestProjAndAct: Record<string, [string]>;
  latestProjAndDesc: Record<string, [string]>;
  close: () => void;
  submitActivity: (activity: Omit<ReportActivity, "id"> & Pick<ReportActivity, "id">) => void;
  selectedDate: Date;
};
