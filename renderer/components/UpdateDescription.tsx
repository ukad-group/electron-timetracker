import React from "react";
import clsx from "clsx";

type UpdateDescriptionProps = {
  update: "old" | "new";
  isUpdateToggle: () => void;
};

export default function UpdateDescription({
  update,
  isUpdateToggle,
}: UpdateDescriptionProps) {
  return (
    <div
      className={clsx(
        "h-16 px-4 py-5 my-6 bg-white shadow overflow-hidden transition-all ease-linear duration-300 sm:rounded-lg sm:px-6",
        {
          "h-52": update === "new",
        }
      )}
    >
      <div>
        <div className="flex justify-between">
          <h2
            id="manual-input-title"
            className="text-lg font-medium text-gray-900"
          >
            What's new in this update
          </h2>
          <button
            onClick={isUpdateToggle}
            className={clsx(
              "transform transition-transform ease-linear duration-300",
              {
                "rotate-180": update === "new",
              }
            )}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3"
              />
            </svg>
          </button>
        </div>

        <ul className="mt-3 h-32  overflow-y-auto">
          <li>
            Neeeeeeeeeeeeeeeeeeeeeeeew Versiooooooooooooooooooooooooooon
            teeeeeeeeeeeeeeeeeeeeeeeest
          </li>
        </ul>
      </div>
    </div>
  );
}
