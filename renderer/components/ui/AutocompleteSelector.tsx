import { Dispatch, SetStateAction, useState, useEffect, useCallback } from "react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/24/solid";

type AutocompleteProps = {
  title: string;
  selectedItem: string;
  availableItems: Array<string>;
  setSelectedItem: Dispatch<SetStateAction<string>>;
  required?: boolean;
  tabIndex?: number;
  isValidationEnabled?: boolean;
  className?: string;
};

export default function AutocompleteSelector({
 title,
 className = "",
 selectedItem,
 availableItems,
 setSelectedItem,
 required = false,
 tabIndex,
 isValidationEnabled
}: AutocompleteProps) {
  const filteredList =
    selectedItem === ""
      ? availableItems
        ?.filter((activity) => {
          return activity !== "";
        })
        .sort()
      : availableItems
        ?.filter((activity) => {
          return activity
            .toLowerCase()
            .includes(selectedItem.toLowerCase());
        })
        .sort();

  const [showList, setShowList] = useState(false);

  const inputChangeHandler = (value) => {
    setSelectedItem(value);
    setShowList(true);
  };

  const selectValueHandler = (value) => {
    setSelectedItem(value);
    setShowList(false);
  };

  const toggleListHandler = (event) => {
    event.stopPropagation()
    event.preventDefault();
    setShowList(!showList);
  }

  const closeListHandler = useCallback((event) => {
    const sameBlock = event.path.find((item) => {
      if (!item) {
        return false;
      }

      if (item.classList) {
        return item.classList.value.includes(generateUniqClassName());
      }

      return false;
    });

    if (!sameBlock) {
      setShowList(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener("click", (event) => {closeListHandler(event)});
    return () => {
      document.removeEventListener("click", (event) => {closeListHandler(event)});
    };
  }, []);

  const generateUniqClassName = () => {
    return title.toLowerCase().replace(" ", "-") + "-autocomplete-container";
  }

  return (
    <div className={className}>
      <div className="block text-sm font-medium text-gray-700">{ title }</div>
      <div className={generateUniqClassName() + " relative mt-1"}>
        <input
          value={selectedItem}
          type="text"
          tabIndex={tabIndex}
          onChange={(event) => inputChangeHandler(event.target.value)}
          className={
            `w-full py-2 pl-3 pr-10 bg-white border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm 
            ${required && isValidationEnabled && !selectedItem ? " border-red-300 text-red-900 placeholder-red-300" : ""}`
          }/>

        {
          showList && (!filteredList || filteredList.length > 0) &&
          <ul className="absolute z-10 w-full py-1 mt-1 overflow-auto text-base bg-white rounded-md shadow-lg max-h-40 ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
            {filteredList?.map((option, i) => (
              <li
                key={i}
                value={option}
                className={`group relative cursor-default select-none py-2 pl-3 pr-9 "text-gray-900" hover:bg-blue-600 hover:text-white`}
                onClick={() => {selectValueHandler(option)}}>
                <span className={option === selectedItem ? "font-semibold" : ""} >
                  {option}
                </span>
                {option === selectedItem && (
                  <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-blue-600 group-hover:text-white">
                    <CheckIcon className="w-5 h-5" aria-hidden="true" />
                  </span>
                )}
              </li>
            ))}
          </ul>
        }
        <button className="absolute inset-y-0 right-0 flex items-center px-2 rounded-r-md focus:outline-none">
          <ChevronUpDownIcon
            className="w-5 h-5 text-gray-400"
            aria-hidden="true"
            onClick={(event) => {toggleListHandler(event)}}
          />
        </button>
      </div>
    </div>
  );
}
