import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import JiraConnection from '../JiraConnection';
import { globalIpcRendererMock } from "@/tests/mocks/electron";
import { IPC_MAIN_CHANNELS } from "@electron/helpers/constants";

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

describe('GIVEN JiraConnection', () => {
  afterAll(() => {
    jest.restoreAllMocks();

    global.ipcRenderer = globalIpcRendererMock;
  });

  it('renders correctly with no users', () => {
    const { getByText, getByRole } = render(<JiraConnection isOnline={true} />);

    expect(getByText('Jira')).toBeInTheDocument();
    expect(getByRole('button')).toHaveTextContent('Add account');
    expect(getByText('No one user authorized')).toBeInTheDocument();
  });

  it('handles sign in button click when online', () => {
    const { getByRole, getByText } = render(<JiraConnection isOnline={true} />);
    global.ipcRenderer.send = jest.fn();

    fireEvent.click(getByRole('button'));

    expect(getByText('Add account')).not.toHaveAttribute('disabled');
    expect(global.ipcRenderer.send).toHaveBeenCalledWith(
      IPC_MAIN_CHANNELS.OPEN_CHILD_WINDOW,
      'jira'
    );
  });

  it('should render disabled button when offline', () => {
    const { getByText } = render(<JiraConnection isOnline={false} />);

    expect(getByText('Add account')).toHaveAttribute('disabled');
  });

  it("displays a message when no user is authorized", () => {
    jest.spyOn(React, "useState").mockImplementationOnce(() => [null, jest.fn()]);

    const { getByText } = render(<JiraConnection isOnline={true} />);

    expect(getByText("No one user authorized")).toBeDefined();
  });
});
