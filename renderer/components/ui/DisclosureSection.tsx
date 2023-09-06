import clsx from "clsx";
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
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#000000"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>
        </div>
        {props.children}
      </div>
    </div>
  );
}
