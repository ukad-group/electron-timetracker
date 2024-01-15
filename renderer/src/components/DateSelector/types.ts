import { Dispatch, SetStateAction } from "react";

export type DateSelectorProps = {
  isDropboxConnected: boolean;
  selectedDate: Date;
  setSelectedDate: Dispatch<SetStateAction<Date>>;
  selectedDateReport: string;
};