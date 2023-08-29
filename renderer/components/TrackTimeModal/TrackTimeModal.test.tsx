import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import TrackTimeModal, { TrackTimeModalProps } from "./TrackTimeModal";

const mockedActivities = [
  {
    id: 1,
    activity: "",
    description: "activity from description",
    duration: 3600000,
    from: "09:00",
    project: "timetracker.e",
    to: "10:00",
  },
  {
    id: 2,
    activity: "",
    description: "activity from description",
    duration: 3600000,
    from: "10:00",
    project: "timetracker.e",
    to: "11:00",
  },
  {
    id: 3,
    activity: "",
    description: "activity from description",
    duration: 3600000,
    from: "11:00",
    project: "timetracker.e",
    to: "12:00",
  },
];

const day = 60 * 60 * 24 * 1000;
const today = new Date();
const yesterday = new Date(today.getTime() - day);

const mockedProps: TrackTimeModalProps = {
  activities: mockedActivities,
  isOpen: true,
  editedActivity: "new",
  latestProjAndAct: {
    internal: [""],
    hr: [""],
  },
  close: jest.fn(),
  submitActivity: jest.fn(),
  selectedDate: new Date(),
};

// mocking the method that requires TrackTimeModal
class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

describe("input value depending on the date", () => {
  window.ResizeObserver = ResizeObserver;

  test("should preffiled if today", () => {
    render(<TrackTimeModal {...mockedProps} />);
    const toInput = screen.getByLabelText("To");

    expect(toInput).not.toHaveValue("");
  });

  test("shouldn't preffiled if not today", () => {
    const mockedPropsYesterday = { ...mockedProps, selectedDate: yesterday };
    render(<TrackTimeModal {...mockedPropsYesterday} />);
    const toInput = screen.getByLabelText("To");

    expect(toInput).toHaveValue("");
  });
});
