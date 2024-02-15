export type BookingsProps = {
  calendarDate: Date;
};

export type BookingFromApi = {
  name: string;
  plans: Array<{
    hours: number;
    month: number;
    year: number;
  }>;
};

export type BookedSpentStat = {
  project: string;
  booked: number;
  spent: number;
};
