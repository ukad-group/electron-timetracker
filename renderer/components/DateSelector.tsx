import { Dispatch, SetStateAction, useEffect } from "react";
import NavButtons from "./ui/NavButtons";
import Button from "../components/ui/Button";

type DateSelectorProps = {
  isDropboxConnected: boolean;
  selectedDate: Date;
  setSelectedDate: Dispatch<SetStateAction<Date>>;
};

const day = 60 * 60 * 24 * 1000;

export default function DateSelector({
  isDropboxConnected,
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

  const todayButtonHandle = () => {
    setSelectedDate(new Date());
  };
  const keydownHandler = (e: KeyboardEvent) => {
    if (e.ctrlKey && e.code === "Tab") {
      if (e.shiftKey) {
        descreaseDate();
      } else {
        increaseDate();
      }
    }
  };

  useEffect(() => {
    document.addEventListener("keydown", keydownHandler);
    return () => {
      document.removeEventListener("keydown", keydownHandler);
    };
  }, []);

  return (
    <div className="flex items-center justify-between px-4 py-5 sm:px-6">
      <div>
        <h1 className="text-lg flex items-center font-semibold leading-6 text-gray-900 dark:text-dark-heading">
          <time dateTime="2022-01-22" className="sm:hidden">
            {formatDate(selectedDate, "short")}
          </time>
          <time dateTime="2022-01-22" className="hidden sm:inline">
            {formatDate(selectedDate, "long")}
          </time>
          {selectedDate.toLocaleDateString() === today.toLocaleDateString() && (
            <span className="inline-flex  px-2.5 py-0.5 ml-3 rounded-full text-xs font-medium bg-blue-300 text-white dark:text-blue-400 dark:bg-blue-400/20">
              Today
            </span>
          )}
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-slate-400 flex">
          {selectedDate?.toLocaleDateString("en-US", { weekday: "long" })}
          {!isDropboxConnected && (
            <span title="Dropbox is not enabled">
              <svg
                className="ml-2 dark:fill-yellow-500/70 fill-yellow-500"
                height="20px"
                width="20px"
                version="1.1"
                id="Layer_1"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="-271 282 256 238"
              >
                <g>
                  <polygon points="-271,414.5 -195.7,463.6 -143,419.7 -218.9,372.8 	" />
                  <polygon points="-195.7,282 -271,331.1 -218.9,372.8 -143,325.9 	" />
                  <polygon points="-15,331.1 -90.3,282 -143,325.9 -67.1,372.8 	" />
                  <polygon points="-143,419.7 -90.3,463.6 -15,414.5 -67.1,372.8 	" />
                  <polygon points="-142.8,429.1 -195.7,473 -218.3,458.2 -218.3,474.8 -142.8,520 -67.4,474.8 -67.4,458.2 -90,473 	" />
                </g>
              </svg>
            </span>
          )}
        </p>
      </div>
      <div className="flex gap-4">
        {selectedDate.toDateString() !== new Date().toDateString() && (
          <Button
            text="Go to current day"
            callback={todayButtonHandle}
            type={"button"}
          />
        )}
        <NavButtons prevCallback={descreaseDate} nextCallback={increaseDate} />
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
