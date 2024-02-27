import { FilterListOptions } from "./types";

export const filterList = ({
  selectedItem,
  availableItems,
  additionalItems,
  showedSuggestionsNumber,
}: FilterListOptions) => {
  const mostRelevantItems: string[] = [];

  const relevantItems: string[] =
    selectedItem === ""
      ? availableItems &&
        [...availableItems].concat(additionalItems ? additionalItems : []).filter((activity, i) => {
          if (showedSuggestionsNumber) {
            return activity !== "" && i < showedSuggestionsNumber;
          }
          return activity !== "";
        })
      : availableItems &&
        [...availableItems]
          .sort()
          .concat(additionalItems ? additionalItems : [])
          .reduce((accumulator: string[], current: string) => {
            let duplicate = false;
            if (current.startsWith("TT:: ") || current.startsWith("JI:: ")) {
              duplicate = availableItems.includes(current.slice(5));
            }
            if (
              !duplicate &&
              current.toLowerCase().includes((selectedItem || "").toLowerCase()) &&
              current.toLowerCase() !== selectedItem.toLowerCase()
            ) {
              accumulator.push(current);
            }
            return accumulator;
          }, [])
          .slice(0, 15);
  return mostRelevantItems.reverse().concat(relevantItems);
};
