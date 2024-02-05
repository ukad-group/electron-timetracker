import { render, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Office365Connection from '../Office365Connection';
import { globalIpcRendererMock } from "@/tests/mocks/electron";
import { IPC_MAIN_CHANNELS } from "@electron/helpers/constants";
import React from "react";

jest.mock("electron", () => ({
  ipcRenderer: {
    send: jest.fn(),
    invoke: jest.fn(),
    on: jest.fn(),
    removeAllListeners: jest.fn(),
  },
}));

global.ipcRenderer = {
  on: jest.fn(),
  removeAllListeners: jest.fn(),
  send: jest.fn(),
  ...globalIpcRendererMock
};

describe('GIVEN Office365Connection', () => {
  afterAll(() => {
    jest.restoreAllMocks();

    global.ipcRenderer = globalIpcRendererMock;
  });

  it('renders correctly with no users', () => {
    const { getByText, getByRole } = render(<Office365Connection isOnline={true} />);

    expect(getByText('Microsoft Office 365')).toBeInTheDocument();
    expect(getByRole('button')).toHaveTextContent('Add account');
    expect(getByText('No one user authorized')).toBeInTheDocument();
  });

  it('renders correctly with users', () => {
    const { getByText, getByRole } = render(<Office365Connection isOnline={true} />);

    expect(getByText('Microsoft Office 365')).toBeInTheDocument();
    expect(getByRole('button')).toHaveTextContent('Add account');
  });

  it('handles sign in button click when online', () => {
    const { getByRole, getByText } = render(<Office365Connection isOnline={true} />);

    fireEvent.click(getByRole('button'));

    expect(getByText('Add account')).not.toHaveAttribute('disabled');
    expect(global.ipcRenderer.send).toHaveBeenCalledWith(
      IPC_MAIN_CHANNELS.OPEN_CHILD_WINDOW,
      'office365'
    );
  });

  it('should render disabled button when offline', () => {
    const { getByText } = render(<Office365Connection isOnline={false} />);

    expect(getByText('Add account')).toHaveAttribute('disabled');
  });

  it("displays a message when no user is authorized", () => {
    jest.spyOn(React, "useState").mockImplementationOnce(() => [null, jest.fn()]);

    const { getByText } = render(<Office365Connection isOnline={true} />);

    expect(getByText("No one user authorized")).toBeDefined();
  });
});
