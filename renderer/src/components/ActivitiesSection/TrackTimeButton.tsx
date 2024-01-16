import { TrackTimeButtonProps } from "./types";
import { Hint } from "@/shared/Hint";

const TrackTimeButton = ({
  isLoading,
  onEditActivity,
}: TrackTimeButtonProps) => (
  <>
    <button
      id="newActivityBtn"
      className="block w-full px-4 py-4 text-sm font-medium text-center text-blue-500 bg-blue-200 hover:bg-blue-300 sm:rounded-b-lg dark:bg-dark-button-back-gray hover:dark:bg-dark-button-gray-hover dark:text-dark-heading"
      onClick={() => onEditActivity("new")}
    >
      Track more time
      <span className="block text-blue-500 text-xs dark:text-dark-heading">
        click or press ctrl + space
      </span>
    </button>
    {/* {!isLoading && (
      <Hint
        refetenceID="newActivityBtn"
        shiftY={30}
        shiftX={200}
        width={"medium"}
        position={{ basePosition: "bottom", diagonalPosition: "right" }}
      >
        To log more time, click the 'Track More Time' button or press ctrl +
        space to access the form for entering new registration today.
      </Hint>
    )} */}
  </>
);

export default TrackTimeButton;
