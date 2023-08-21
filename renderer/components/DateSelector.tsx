import { Dispatch, SetStateAction } from "react";
import NavButtons from "./ui/NavButtons";

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
          {selectedDate.getDay() === today.getDay() && (
            <span className="inline-flex  px-2.5 py-0.5 ml-3 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Today
            </span>
          )}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          {selectedDate?.toLocaleDateString("en-US", { weekday: "long" })}
        </p>
      </div>
      <NavButtons prevCallback={descreaseDate} nextCallback={increaseDate} />
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
