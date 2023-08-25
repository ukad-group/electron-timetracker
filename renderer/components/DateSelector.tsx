import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";
import { Dispatch, SetStateAction, useEffect } from "react";

type DateSelectorProps = {
  selectedDate: Date;
  setSelectedDate: Dispatch<SetStateAction<Date>>;
};

const day = 60 * 60 * 24 * 1000;

export default function DateSelector({
  selectedDate,
  setSelectedDate,
}: DateSelectorProps) {
  const today = new Date();
  const increaseDate = () => {
    setSelectedDate((date) => new Date(date.getTime() + day));
  };
  const descreaseDate = () => {
    setSelectedDate((date) => new Date(date.getTime() - day));
  };

  const moveOnPressHandler = (e: KeyboardEvent) => {
    if (e.code === "ArrowRight" && e.ctrlKey) {
      increaseDate();
    } else if (e.code === "ArrowLeft" && e.ctrlKey) {
      descreaseDate();
    }
  };

  useEffect(() => {
    document.addEventListener("keydown", moveOnPressHandler);
    return () => {
      document.removeEventListener("keydown", moveOnPressHandler);
    };
  }, []);

  return (
    <div className="flex items-center justify-between px-4 py-5 sm:px-6">
      <div>
        <h1 className="text-lg flex items-center font-semibold leading-6 text-gray-900">
          <time dateTime="2022-01-22" className="sm:hidden">
            {formatDate(selectedDate, "short")}
          </time>
          <time dateTime="2022-01-22" className="hidden sm:inline">
            {formatDate(selectedDate, "long")}
          </time>
          {selectedDate.toLocaleDateString() === today.toLocaleDateString() && (
            <span className="inline-flex  px-2.5 py-0.5 ml-3 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Today
            </span>
          )}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          {selectedDate?.toLocaleDateString("en-US", { weekday: "long" })}
        </p>
      </div>
      <div className="flex flex-col items-center">
        <div className="flex items-center rounded-md shadow-sm">
          <button
            type="button"
            className="flex items-center justify-center py-2 pl-3 pr-4 text-gray-400 bg-white border border-r-0 border-gray-300 rounded-l-md hover:text-gray-500 md:w-9 md:px-2 md:hover:bg-gray-50"
            onClick={descreaseDate}
          >
            <span className="sr-only">Previous day</span>
            <ChevronLeftIcon className="w-5 h-5" aria-hidden="true" />
          </button>
          <span className="relative w-px h-5 -mx-px bg-gray-300" />
          <button
            type="button"
            className="flex items-center justify-center py-2 pl-4 pr-3 text-gray-400 bg-white border border-l-0 border-gray-300 rounded-r-md hover:text-gray-500 md:w-9 md:px-2 md:hover:bg-gray-50"
            onClick={increaseDate}
          >
            <span className="sr-only">Next day</span>
            <ChevronRightIcon className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>
        <span className="block text-xs text-gray-500 text-center">
          or press ctrl + arrow
        </span>
      </div>
    </div>
  );
}

function formatDate(date: Date, type: "short" | "long" = "long") {
  return date.toLocaleDateString("en-US", {
    month: type,
    day: "numeric",
    year: "numeric",
  });
}
