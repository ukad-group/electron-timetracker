import { Combobox } from "@headlessui/react";
import clsx from "clsx";
import { CheckIcon } from "@heroicons/react/24/solid";

const SuggestionsList = ({ list }) =>
  list.map((item, i) => (
    <Combobox.Option
      key={i}
      value={item}
      className={({ active }) =>
        clsx(
          "relative cursor-default select-none py-2 pl-3 pr-9",
          active ? "bg-blue-600 text-white dark:bg-indigo-800" : "text-gray-900 dark:text-dark-main",
        )
      }
    >
      {({ active, selected }) => (
        <>
          <span className={clsx("block truncate", selected && "font-semibold")}>{item}</span>

          {selected && (
            <span
              className={clsx(
                "absolute inset-y-0 right-0 flex items-center pr-4",
                active ? "text-white" : "text-blue-600",
              )}
            >
              <CheckIcon className="w-5 h-5" aria-hidden="true" />
            </span>
          )}
        </>
      )}
    </Combobox.Option>
  ));

export default SuggestionsList;
