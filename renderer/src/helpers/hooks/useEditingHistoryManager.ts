import { useReducer, useCallback } from "react";

interface EditingHistoryState<T> {
  undoStack: T[];
  redoStack: T[];
}

type EditingHistoryAction<T> =
  | { type: "SET_VALUE"; value: T }
  | { type: "UNDO" }
  | { type: "REDO" };

const EditingHistoryReducer = <T>(
  state: EditingHistoryState<T>,
  action: EditingHistoryAction<T>
): EditingHistoryState<T> => {
  switch (action.type) {
    case "SET_VALUE":
      if (state.undoStack[state.undoStack.length - 1] !== action.value) {
        return {
          undoStack: [...state.undoStack, action.value],
          redoStack: [],
        };
      }

      return state;

    case "UNDO":
      if (state.undoStack.length > 1) {
        return {
          undoStack: state.undoStack.slice(0, -1),
          redoStack: [
            ...state.redoStack,
            state.undoStack[state.undoStack.length - 1],
          ],
        };
      }

      return state;

    case "REDO":
      if (state.redoStack.length > 0) {
        return {
          undoStack: [
            ...state.undoStack,
            state.redoStack[state.redoStack.length - 1],
          ],
          redoStack: state.redoStack.slice(0, -1),
        };
      }

      return state;

    default:
      return state;
  }
};

const useEditingHistoryManager = <T>(initialValue: T) => {
  const undoState: EditingHistoryState<T> = {
    undoStack: [initialValue],
    redoStack: [],
  };
  const [state, dispatch] = useReducer(EditingHistoryReducer<T>, undoState);

  const doSetValue = (value) => dispatch({ type: "SET_VALUE", value });
  const doUndo = () => {
    dispatch({ type: "UNDO" }); // same here

    if (state.undoStack.length > 2) {
      return state.undoStack[state.undoStack.length - 2];
    }

    return state.undoStack[0];
  };
  const doRedo = () => {
    dispatch({ type: "REDO" }); // same here

    return state.redoStack[state.redoStack.length - 1];
  };

  const setValue = useCallback(doSetValue, [dispatch]);
  const undo = useCallback(doUndo, [dispatch, state]);
  const redo = useCallback(doRedo, [dispatch, state]);

  return {
    setValue,
    undo,
    redo,
  };
};

export default useEditingHistoryManager;
