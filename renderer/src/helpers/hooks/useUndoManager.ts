import { useReducer, useCallback } from "react";

interface UndoState<T> {
  // в UndoState redoStack? назви це щось типу EditingHistoryState
  undoStack: T[];
  redoStack: T[];
}

type UndoAction<T> =
  | { type: "SET_VALUE"; value: T }
  | { type: "UNDO" }
  | { type: "REDO" };

// чому у UndoAction може бути тип SET_VALUE або REDO. назва невдала.

const undoReducer = <T>(
  state: UndoState<T>,
  action: UndoAction<T>
): UndoState<T> => {
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

const useUndoManager = <T>(initialValue: T) => {
  const undoState: UndoState<T> = {
    undoStack: [initialValue],
    redoStack: [],
  };
  const [state, dispatch] = useReducer(undoReducer<T>, undoState);

  const setValue = useCallback(
    (value) => {
      dispatch({ type: "SET_VALUE", value }); // краще зробити action creator function
    },
    [dispatch]
  );

  const undo = useCallback(() => {
    dispatch({ type: "UNDO" }); // same here

    if (state.undoStack.length > 2) {
      return state.undoStack[state.undoStack.length - 2];
    } else {
      // else не потрібно, просто return після умови
      return state.undoStack[0];
    }
  }, [dispatch, state]);

  const redo = useCallback(() => {
    dispatch({ type: "REDO" }); // same here

    return state.redoStack[state.redoStack.length - 1];
  }, [dispatch, state]);

  return {
    setValue,
    undo,
    redo,
  };
};

export default useUndoManager;
