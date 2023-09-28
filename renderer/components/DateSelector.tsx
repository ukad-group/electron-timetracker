import { Dispatch, SetStateAction } from "react";
import NavButtons from "./ui/NavButtons";
import Button from "../components/ui/Button";

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
  const todayButtonHandle = () => {
    setSelectedDate(new Date());
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
          {selectedDate.toLocaleDateString() === today.toLocaleDateString() && (
            <span className="inline-flex  px-2.5 py-0.5 ml-3 rounded-full text-xs font-medium bg-blue-300 text-white">
              Today
            </span>
          )}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          {selectedDate?.toLocaleDateString("en-US", { weekday: "long" })}
        </p>
      </div>
      <div className="flex gap-4">
        {selectedDate.getDay() !== new Date().getDay() && (
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
