import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import Modal from "../Modal";

global.ResizeObserver = jest.fn(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

describe("GIVEN Modal", () => {
  test("renders modal with title", () => {
    const onCloseMock = jest.fn();
    const onSubmitMock = jest.fn();

    render(
      <Modal isOpen={true} title="Test Modal" onClose={onCloseMock} onSubmit={onSubmitMock}>
        <div>Mocked component</div>
      </Modal>,
    );

    const titleElement = screen.getByText(/Test Modal/i);
    expect(titleElement).toBeInTheDocument();
  });

  test("calls onClose when close button is clicked", () => {
    const onCloseMock = jest.fn();
    const onSubmitMock = jest.fn();

    render(
      <Modal isOpen={true} title="Test Modal" onClose={onCloseMock} onSubmit={onSubmitMock}>
        <div>Mocked component</div>
      </Modal>,
    );

    const closeButton = screen.getByRole("button", { name: /Close/i });
    fireEvent.click(closeButton);

    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });
});
