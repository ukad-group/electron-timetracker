import React from "react";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SuggestionsList from "../SuggestionsList";
import { Combobox } from "@headlessui/react";

describe("GIVEN SuggestionsList", () => {
  const mockList = ["Option1", "Option2", "Option3"];

  it("renders suggestions list correctly", () => {
    render(
      <Combobox>
        <SuggestionsList list={mockList} />
      </Combobox>,
    );

    const options = screen.getAllByRole("option");
    expect(options).toHaveLength(mockList.length);

    const firstOption = options[0];
    expect(firstOption).toHaveClass("py-2 pl-3 pr-9");
    expect(firstOption).toHaveClass("text-gray-900 dark:text-dark-main");

    userEvent.click(firstOption);

    expect(firstOption).toHaveClass(
      "relative cursor-default select-none py-2 pl-3 pr-9 text-gray-900 dark:text-dark-main",
    );
  });
});
