export const filterList = ({
  selectedItem,
  availableItems,
  additionalItems,
  showedSuggestionsNumber
}) =>
  selectedItem === ""
  ? availableItems &&
  [...availableItems]
    .concat(additionalItems ? additionalItems : [])
    .filter((activity, i) => {
      if (showedSuggestionsNumber) {
        return activity !== "" && i < showedSuggestionsNumber;
      }
      return activity !== "";
    })
  : availableItems &&
  [...availableItems]
    .sort()
    .concat(additionalItems ? additionalItems : [])
    .reduce((accumulator, current) => {
      let duplicate = false;
      if (current.startsWith("TT:: ") || current.startsWith("JI:: ")) {
        duplicate = availableItems.includes(current.slice(5));
      }
      if (
        !duplicate &&
        current.toLowerCase() === selectedItem.toLowerCase()
      ) {
        accumulator.unshift(current);
      } else if (
        !duplicate &&
        current
          .toLowerCase()
          .includes((selectedItem || "").toLowerCase())
      ) {
        accumulator.push(current);
      }
      return accumulator;
    }, [])
    .slice(0, 15);