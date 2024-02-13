import React from "react";
import { render, fireEvent, screen, act } from "@testing-library/react";
import FolderSelector from "../FolderSelector";
import { globalIpcRendererMock } from "@/tests/mocks/electron";

jest.mock("@heroicons/react/24/solid", () => ({
  PencilIcon: () => <span data-testid="pencil-icon">MockPencilIcon</span>,
}));

jest.mock("@electron/helpers/constants", () => ({
  IPC_MAIN_CHANNELS: {
    APP_SELECT_FOLDER: "APP_SELECT_FOLDER",
  },
}));

global.ipcRenderer = {
  invoke: jest.fn(),
  ...globalIpcRendererMock,
};

describe("GIVEN FolderSelector", () => {
  afterAll(() => {
    global.ipcRenderer = globalIpcRendererMock;
  });

  it("renders FolderSelector component", () => {
    const folderLocation = "/path/to/folder";
    const setFolderLocation = jest.fn();

    render(<FolderSelector folderLocation={folderLocation} setFolderLocation={setFolderLocation} />);

    expect(screen.getByTitle(folderLocation)).toBeDefined();
    expect(screen.getByTestId("pencil-icon")).toBeDefined();
  });

  it("calls setFolderLocation when button is clicked", async () => {
    const folderLocation = "/path/to/folder";
    const setFolderLocation = jest.fn();

    render(<FolderSelector folderLocation={folderLocation} setFolderLocation={setFolderLocation} />);

    (global.ipcRenderer.invoke as jest.Mock).mockResolvedValueOnce("/selected/folder");

    await act(async () => {
      fireEvent.click(screen.getByTitle(folderLocation));
    });

    expect(setFolderLocation).toHaveBeenCalledWith("/selected/folder");
  });
});
