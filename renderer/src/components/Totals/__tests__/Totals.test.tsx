import { render, screen, fireEvent, within } from "@testing-library/react";
import Totals from "../Totals";
import { globalIpcRendererMock } from "@/tests/mocks/electron";

jest.mock("next/router", () => ({
  useRouter: jest.fn(() => ({ push: jest.fn() })),
}));

jest.mock("electron", () => ({
  ipcRenderer: {
    send: jest.fn(),
    invoke: jest.fn(),
    on: jest.fn(),
    removeAllListeners: jest.fn(),
    removeListener: jest.fn(),
  },
}));

global.ipcRenderer = {
  on: jest.fn(),
  removeAllListeners: jest.fn(),
  removeListener: jest.fn(),
  send: jest.fn(),
  invoke: jest.fn(),
  ...globalIpcRendererMock,
};

const fakeDate = new Date("2024-03-20T11:30:00");
const fakeTomorrowDate = new Date("2024-03-21T11:30:00");

describe("Totals date changes", () => {
  it("displays the correct date text ", () => {
    render(<Totals selectedDate={fakeDate} />);

    const totalsButton = screen.getByTestId("totals-list-button");

    expect(totalsButton.textContent).toBe("Totals 20 Mar");
  });

  it("displays options when clicking button", () => {
    render(<Totals selectedDate={fakeDate} />);

    const totalsButton = screen.getByTestId("totals-list-button");
    fireEvent.click(totalsButton);

    const totalsSelector = screen.getByTestId("totals-options");

    expect(totalsSelector).toBeDefined();
  });

  it("displays the correct date text when clicking an week option in the totals selector", () => {
    render(<Totals selectedDate={fakeDate} />);

    const totalsButton = screen.getByTestId("totals-list-button");
    fireEvent.click(totalsButton);

    const totalsOptions = screen.getByTestId("totals-options");
    const weekOption = within(totalsOptions).getByText("week");
    fireEvent.click(weekOption);

    expect(totalsButton.textContent).toBe("Totals week 12");
  });

  it("displays the correct date text when clicking an month option in the totals selector", () => {
    render(<Totals selectedDate={fakeDate} />);

    const totalsButton = screen.getByTestId("totals-list-button");
    fireEvent.click(totalsButton);

    const totalsOptions = screen.getByTestId("totals-options");
    const weekOption = within(totalsOptions).getByText("month");
    fireEvent.click(weekOption);

    expect(totalsButton.textContent).toBe("Totals March");
  });

  it("displays the 'today' text when setting a fake today date", () => {
    jest.spyOn(global, "Date").mockImplementation(() => fakeDate);

    render(<Totals selectedDate={fakeDate} />);

    const totalsButton = screen.getByTestId("totals-list-button");

    expect(totalsButton.textContent).toBe("Totals today");
  });

  it("displays the 'yesterday' text when setting a fake tomorrow date", () => {
    jest.spyOn(global, "Date").mockImplementation(() => fakeTomorrowDate);

    render(<Totals selectedDate={fakeDate} />);

    const totalsButton = screen.getByTestId("totals-list-button");

    expect(totalsButton.textContent).toBe("Totals yesterday");
  });
});
