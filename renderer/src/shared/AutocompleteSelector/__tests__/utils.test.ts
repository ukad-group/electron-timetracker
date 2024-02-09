import { filterList } from "../utils";

describe("GIVEN utils/filterList", () => {
  const availableItems = [
    "Apple",
    "Cranberry",
    "Banana",
    "Strawberry",
    "Orange",
    "Pear",
  ];
  const additionalItems = ["Grapes", "Kiwi"];
  const showedSuggestionsNumber = 3;

  it("filters the list when selectedItem is an empty string", () => {
    const selectedItem = "";
    const result = filterList({
      selectedItem,
      availableItems,
      additionalItems,
      showedSuggestionsNumber,
    });

    expect(result).toEqual(["Apple", "Cranberry", "Banana"]);
  });

  it("filters the list when selectedItem is not an empty string", () => {
    const selectedItem = "Ba";
    const result = filterList({
      selectedItem,
      availableItems,
      additionalItems,
      showedSuggestionsNumber,
    });

    expect(result).toEqual(["Banana"]);
  });

  it('handles duplicates when selectedItem starts with "TT:: "', () => {
    const selectedItem = "TT:: Test";
    const result = filterList({
      selectedItem,
      availableItems,
      additionalItems,
      showedSuggestionsNumber,
    });

    expect(result).toEqual([]);
  });

  it('handles duplicates when selectedItem starts with "JI:: "', () => {
    const selectedItem = "JI:: Example";
    const result = filterList({
      selectedItem,
      availableItems,
      additionalItems,
      showedSuggestionsNumber,
    });

    expect(result).toEqual([]);
  });

  it("first appears to be the most relevant option", () => {
    const selectedItem = "B";
    const result = filterList({
      selectedItem,
      availableItems,
      additionalItems,
      showedSuggestionsNumber,
    });

    expect(result).toEqual(["Banana", "Cranberry", "Strawberry"]);
  });
});
