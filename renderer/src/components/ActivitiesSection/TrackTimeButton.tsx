import { TrackTimeButtonProps } from "./types";
import { Hint } from "@/shared/Hint";

const TrackTimeButton = ({
  isLoading,
  onEditActivity,
}: TrackTimeButtonProps) => (
  <>
    <button
      className="block w-full px-4 py-4 text-sm font-medium text-center text-blue-500 bg-blue-200 hover:bg-blue-300 sm:rounded-b-lg dark:bg-dark-button-back-gray hover:dark:bg-dark-button-gray-hover dark:text-dark-heading"
      onClick={() => onEditActivity("new")}
    >
      Track more time
      <span className="block text-blue-500 text-xs dark:text-dark-heading">
        click or press ctrl + space
      </span>
    </button>
  </>
);

export default TrackTimeButton;
