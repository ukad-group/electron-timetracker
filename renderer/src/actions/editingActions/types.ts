export type EditingHistoryAction =
  | { type: "SET_VALUE"; value: string }
  | { type: "UNDO" }
  | { type: "REDO" };
