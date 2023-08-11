import clsx from "clsx";
import { Dispatch, SetStateAction } from "react";
import { Combobox } from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/24/solid";

type ActivitySelectorProps = {
  className?: string;
  selectedActivity: string;
  availableActivities: Array<string>;
  setSelectedActivity: Dispatch<SetStateAction<string>>;
  required?: boolean;
  tabIndex?: number;
};

export default function ActivitySelector({
  className,
  selectedActivity,
  availableActivities,
  setSelectedActivity,
  required = false,
  tabIndex,
}: ActivitySelectorProps) {
  const filteredActivities =
    selectedActivity === ""
      ? availableActivities
      : availableActivities?.filter((activity) => {
          return activity
            .toLowerCase()
            .includes(selectedActivity.toLowerCase());
        });

  return (
    <Combobox
      className={className}
      as="div"
      value={selectedActivity}
      onChange={setSelectedActivity}
    >
      <Combobox.Label className="block text-sm font-medium text-gray-700">
        Activity
      </Combobox.Label>
      <div className="relative mt-1">
        <Combobox.Input
          required={required}
          spellCheck={false}
          className={
            "w-full py-2 pl-3 pr-10 bg-white border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
          }
          onChange={(event) => setSelectedActivity(event.target.value)}
          tabIndex={tabIndex}
        />
        <Combobox.Button className="absolute inset-y-0 right-0 flex items-center px-2 rounded-r-md focus:outline-none">
          <ChevronUpDownIcon
            className="w-5 h-5 text-gray-400"
            aria-hidden="true"
          />
        </Combobox.Button>

        {filteredActivities?.length > 0 && (
          <Combobox.Options className="absolute z-10 w-full py-1 mt-1 overflow-auto text-base bg-white rounded-md shadow-lg max-h-40 ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
            {filteredActivities?.map((activity, i) => (
              <Combobox.Option
                key={i}
                value={activity}
                className={({ active }) =>
                  clsx(
                    "relative cursor-default select-none py-2 pl-3 pr-9",
                    active ? "bg-blue-600 text-white" : "text-gray-900"
                  )
                }
              >
                {({ active, selected }) => (
                  <>
                    <span
                      className={clsx(
                        "block truncate",
                        selected && "font-semibold"
                      )}
                    >
                      {activity}
                    </span>

                    {selected && (
                      <span
                        className={clsx(
                          "absolute inset-y-0 right-0 flex items-center pr-4",
                          active ? "text-white" : "text-blue-600"
                        )}
                      >
                        <CheckIcon className="w-5 h-5" aria-hidden="true" />
                      </span>
                    )}
                  </>
                )}
              </Combobox.Option>
            ))}
          </Combobox.Options>
        )}
      </div>
    </Combobox>
  );
}
