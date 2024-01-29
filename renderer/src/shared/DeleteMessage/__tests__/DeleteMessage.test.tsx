import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import DeleteMessage from "../DeleteMessage";
import { useMainStore } from "@/store/mainStore";

jest.mock("@/store/mainStore", () => ({
  useMainStore: jest.fn(),
}));

jest.mock("electron", () => ({
  ipcRenderer: {
    on: jest.fn(),
    removeAllListeners: jest.fn(),
    invoke: jest.fn(),
    send: jest.fn(),
  },
}));

describe("DeleteMessage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders without errors", () => {
    // @ts-ignore
    useMainStore.mockReturnValue([null, jest.fn()]); // Mock the useMainStore hook as needed
    render(
      <DeleteMessage
        setShowDeleteButton={() => {}}
        setShowDeleteMessage={() => {}}
        selectedDate={new Date}
        setSelectedDateReport={() => {}}
      />
    );
  });

  it("handles cancel button click", () => {
    const setShowDeleteMessageMock = jest.fn();

    // @ts-ignore
    useMainStore.mockReturnValue([null, jest.fn()]); // Mock the useMainStore hook as needed
    render(
      <DeleteMessage
        setShowDeleteButton={() => {}}
        setShowDeleteMessage={setShowDeleteMessageMock}
        selectedDate={new Date}
        setSelectedDateReport={() => {}}
      />
    );

    const cancelButton = screen.getByText("Cancel");
    fireEvent.click(cancelButton);

    expect(setShowDeleteMessageMock).toHaveBeenCalledWith(false);
  });
});
