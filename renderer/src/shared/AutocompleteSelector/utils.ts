export const filterList = ({ selectedItem, availableItems, additionalItems, showedSuggestionsNumber }) => {
  const mostRelevantItems = [];

  const relevantItems =
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
          .reduce((accumulator, current) => {
            let duplicate = false;
            if (current.startsWith("TT:: ") || current.startsWith("JI:: ")) {
              duplicate = availableItems.includes(current.slice(5));
            }
            if (
              !duplicate &&
              current.toLowerCase().includes((selectedItem || "").toLowerCase()) &&
              current.toLowerCase() !== selectedItem.toLowerCase()
            ) {
              if (current.toLowerCase().split("").slice(0, selectedItem.length).join("") == selectedItem) {
                mostRelevantItems.unshift(current);
              } else {
                accumulator.push(current);
              }
            }
            return accumulator;
          }, [])
          .slice(0, 15);

  return mostRelevantItems.reverse().concat(relevantItems);
};
