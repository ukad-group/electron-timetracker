import { SetStateAction } from "react";

export type ManualInputFormProps = {
  onSave: (selectedDateReport: SetStateAction<string>, shouldAutosave: SetStateAction<boolean>) => void;
  selectedDateReport: string;
  selectedDate: Date;
  setSelectedDateReport: (value: string) => void;
};
