import { SET_VALUE, UNDO, REDO } from "./constants";
import { EditingHistoryAction } from "./types";

const setValue = (value: string): EditingHistoryAction => ({
  type: SET_VALUE,
  value,
});

const undoEditing = (): EditingHistoryAction => ({
  type: UNDO,
});

const redoEditing = (): EditingHistoryAction => ({
  type: REDO,
});

export { setValue, undoEditing, redoEditing };
