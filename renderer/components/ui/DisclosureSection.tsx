import clsx from "clsx";
import { ChevronDownIcon } from "@heroicons/react/24/solid";
import React from "react";

export default function DisclosureSection(props) {
  return (
    <div className="lg:absolute mt-6 w-full">
      <div
        className={clsx(
          "h-16 px-4 py-5 bg-white shadow overflow-hidden transition-all ease-linear duration-300 sm:rounded-lg sm:px-6",
          {
            "h-80 overflow-y-auto ": props.isOpen,
          }
        )}
      >
        <div
          className="flex justify-between  cursor-pointer"
          onClick={props.toggleFunction}
        >
          <h2
            id="manual-input-title"
            className="text-lg font-medium text-gray-900"
          >
            {props.title}
          </h2>
          <button
            className={clsx(
              "transform transition-transform ease-linear duration-300",
              {
                "rotate-180": props.isOpen,
              }
            )}
          >
            <ChevronDownIcon className="w-6 h-7" aria-hidden="true" />
          </button>
        </div>
        {props.children}
      </div>
    </div>
  );
}
