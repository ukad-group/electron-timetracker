import { Dispatch, SetStateAction } from "react";
import { ReportActivity } from "@/helpers/utils/reports";

export type MainPageProps = {
  selectedDateActivities: Array<ReportActivity>;
  setSelectedDateActivities: Dispatch<SetStateAction<Array<ReportActivity>>>;
  setShouldAutosave: Dispatch<SetStateAction<boolean>>;
  selectedDate: Date;
  shouldAutosave: boolean;
  setSelectedDate: Dispatch<SetStateAction<Date>>;
  latestProjAndAct: Record<string, [string]>;
  setTrackTimeModalActivity: Dispatch<SetStateAction<ReportActivity | "new">>;
};
