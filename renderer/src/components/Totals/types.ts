export interface Description {
  id: string;
  name: string;
  duration: number;
}

export interface Activity extends Description {
  descriptions: Description[];
}

export interface Total extends Activity {
  activities: Activity[];
}

export type PeriodWithDate = { periodName: PeriodName; date: string };

export type PeriodName = "day" | "week" | "month";
