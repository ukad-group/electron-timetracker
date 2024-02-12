import { setValue, undoEditing, redoEditing } from "../actions";
import { SET_VALUE, UNDO, REDO } from "../constants";

describe("GIVEN editingActions/actions.ts", () => {
  it("should create an action to set value", () => {
    const value = "testValue";
    const expectedAction = {
      type: SET_VALUE,
      value
    };

    expect(setValue(value)).toEqual(expectedAction);
  });

  it("should create an action to undo editing", () => {
    const expectedAction = {
      type: UNDO
    };

    expect(undoEditing()).toEqual(expectedAction);
  });

  it("should create an action to redo editing", () => {
    const expectedAction = {
      type: REDO
    };

    expect(redoEditing()).toEqual(expectedAction);
  });
});
