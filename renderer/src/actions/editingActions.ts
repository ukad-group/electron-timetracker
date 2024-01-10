export type EditingHistoryAction<T> =
  | { type: "SET_VALUE"; value: T }
  | { type: "UNDO" }
  | { type: "REDO" };

const setValue = (value: string): EditingHistoryAction<string> => ({
  type: "SET_VALUE",
  value,
});

const undo = (): EditingHistoryAction<string> => ({
  type: "UNDO",
});

const redo = (): EditingHistoryAction<string> => ({
  type: "REDO",
});

export const actions = { setValue, undo, redo };
