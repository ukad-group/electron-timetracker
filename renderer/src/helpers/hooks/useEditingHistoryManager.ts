import { useReducer, useCallback } from "react";
import { EditingHistoryAction, actions } from "../../actions/editingActions";

interface EditingHistoryState<T> {
  undoStack: T[];
  redoStack: T[];
}

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
  const editingHistoryState: EditingHistoryState<T> = {
    undoStack: [initialValue],
    redoStack: [],
  };
  const [state, dispatch] = useReducer(
    EditingHistoryReducer<T>,
    editingHistoryState
  );

  const setValue = useCallback(
    (value: string) =>
      dispatch(actions.setValue(value) as EditingHistoryAction<T>),
    [dispatch]
  );
  const undo = useCallback(() => {
    dispatch(actions.undo() as EditingHistoryAction<T>);

    if (state.undoStack.length > 2) {
      return state.undoStack[state.undoStack.length - 2];
    }

    return state.undoStack[0];
  }, [dispatch, state]);
  const redo = useCallback(() => {
    dispatch(actions.redo() as EditingHistoryAction<T>);

    return state.redoStack[state.redoStack.length - 1];
  }, [dispatch, state]);

  return {
    setValue,
    undo,
    redo,
  };
};

export default useEditingHistoryManager;
