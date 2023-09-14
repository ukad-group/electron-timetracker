import TimeBadge, { TimeBadgeProps } from "./TimeBadge";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";

const day = 60 * 60 * 24 * 1000;
const today = new Date();
const yesterday = new Date(today.getTime() - day);

const yesterdayLess6MockedProps: TimeBadgeProps = {
  hours: 5,
  startTime: "08:00",
  selectedDate: yesterday,
};
const yesterdayLess8MockedProps: TimeBadgeProps = {
  hours: 7,
  startTime: "08:00",
  selectedDate: yesterday,
};

const todayMorningLess6MockedProps: TimeBadgeProps = {
  hours: 5,
  startTime: "10:00",
  selectedDate: today,
};
const todayMorningLess8MockedProps: TimeBadgeProps = {
  hours: 7,
  startTime: "10:00",
  selectedDate: today,
};

const todayEveningLess6MockedProps: TimeBadgeProps = {
  hours: 5,
  startTime: "02:00",
  selectedDate: today,
};
const todayEveningLess8MockedProps: TimeBadgeProps = {
  hours: 7,
  startTime: "02:00",
  selectedDate: today,
};

const useFakeTime = () => {
  const currentDateTime = new Date();
  currentDateTime.setHours(11, 30);

  jest.useFakeTimers();
  jest.setSystemTime(currentDateTime);
};
useFakeTime();

describe("badge for the previous day", () => {
  test("should render 'less than 6h' when hours are less than 6", () => {
    render(<TimeBadge {...yesterdayLess6MockedProps} />);

    const element = screen.getByTestId("less6");
    expect(element).toBeInTheDocument();
  });

  test("should render 'less than 8h' when hours are less than 8", () => {
    render(<TimeBadge {...yesterdayLess8MockedProps} />);

    const element = screen.getByTestId("less8");
    expect(element).toBeInTheDocument();
  });

  // test("should render any badge when hours are more than 8", () => {
  //   render(<TimeBadge {...yesterdayMore8MockedProps} />);

  //   const element8Hours = screen.getByTestId("less8");
  //   const element6Hours = screen.getByTestId("less6");
  //   expect(element8Hours).not.toBeInTheDocument();
  //   expect(element6Hours).not.toBeInTheDocument();
  // });
});

describe("badge for the today morning", () => {
  test("should render 'less than 8h' when hours are less than 6", () => {
    render(<TimeBadge {...todayMorningLess6MockedProps} />);

    const element = screen.getByTestId("less8");
    expect(element).toBeInTheDocument();
  });

  test("should render 'less than 8h' when hours are less than 8", () => {
    render(<TimeBadge {...todayMorningLess8MockedProps} />);

    const element = screen.getByTestId("less8");
    expect(element).toBeInTheDocument();
  });

  // test("should render any badge when hours are more than 8", () => {
  //   render(<TimeBadge {...todayMore8MockedProps} />);

  //   const element8Hours = screen.getByTestId("less8");
  //   const element6Hours = screen.getByTestId("less6");
  //   expect(element8Hours).not.toBeInTheDocument();
  //   expect(element6Hours).not.toBeInTheDocument();
  // });
});

describe("badge for the today evening", () => {
  test("should render 'less than 6h' when hours are less than 6", () => {
    render(<TimeBadge {...todayEveningLess6MockedProps} />);

    const element = screen.getByTestId("less6");
    expect(element).toBeInTheDocument();
  });

  test("should render 'less than 8h' when hours are less than 8", () => {
    render(<TimeBadge {...todayEveningLess8MockedProps} />);

    const element = screen.getByTestId("less8");
    expect(element).toBeInTheDocument();
  });

  // test("should render any badge when hours are more than 8", () => {
  //   render(<TimeBadge {...todayMore8MockedProps} />);

  //   const element8Hours = screen.getByTestId("less8");
  //   const element6Hours = screen.getByTestId("less6");
  //   expect(element8Hours).not.toBeInTheDocument();
  //   expect(element6Hours).not.toBeInTheDocument();
  // });
});
