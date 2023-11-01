import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";

type NavButtonsProps = {
  prevCallback: () => void;
  nextCallback: () => void;
};

export default function NavButtons({
  prevCallback,
  nextCallback,
}: NavButtonsProps) {
  return (
    <div className="flex items-center rounded-md shadow-sm">
      <button
        type="button"
        className="flex items-center justify-center py-2 pl-3 pr-4 text-gray-400 bg-white border border-r-0 border-gray-300 dark:border-gray-800 rounded-l-md hover:text-gray-500 md:w-9 md:px-2 md:hover:bg-gray-50 dark:bg-dark-button-back-gray md:hover:dark:bg-dark-button-gray-hover"
        onClick={prevCallback}
      >
        <span className="sr-only">Previous day</span>
        <ChevronLeftIcon
          className="w-5 h-5 dark:text-gray-200"
          aria-hidden="true"
        />
      </button>
      <span className="relative w-px h-5 -mx-px bg-gray-300 dark:bg-gray-800" />
      <button
        type="button"
        className="flex items-center justify-center py-2 pl-4 pr-3 text-gray-400 bg-white border border-l-0 border-gray-300 dark:border-gray-800 rounded-r-md hover:text-gray-500 md:w-9 md:px-2 md:hover:bg-gray-50 dark:bg-dark-button-back-gray md:hover:dark:bg-dark-button-gray-hover"
        onClick={nextCallback}
      >
        <span className="sr-only">Next day</span>
        <ChevronRightIcon
          className="w-5 h-5 dark:text-gray-200"
          aria-hidden="true"
        />
      </button>
    </div>
  );
}
