import Loader from "./Loader";

type ButtonProps = {
  text: string;
  callback?: () => void;
  disabled?: boolean;
  status?: string;
  type?: "button" | "submit" | "reset";
  tabIndex?: number;
};

const basicStyles =
  "inline-flex items-center justify-center px-4 py-2 text-sm font-medium border rounded-md shadow-sm  ";
const defaultStyles = "bg-blue-600 text-white ";
const saveHoverStyles = "hover:bg-blue-700 ";
const cancelHoverStyles = "hover:bg-gray-50 ";
const focusStyles =
  "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ";
const disabledStyles = "disabled:pointer-events-none disabled:bg-gray-300 ";

export default function Button({
  callback,
  text,
  disabled,
  status,
  type = "button",
  tabIndex,
}: ButtonProps) {
  const saveBtnStatuses = {
    enabled: {
      text: "Save",
      classes: "bg-blue-600 text-white border-transparent " + saveHoverStyles,
    },
    disabled: {
      text: "Save",
      classes: "bg-grey-600 text-white border-transparent " + saveHoverStyles,
    },
    inprogress: {
      text: "Saving...",
      classes: "bg-blue-600 text-white border-transparent " + saveHoverStyles,
    },
    loading: {
      text: "Loading",
      classes: "bg-blue-600 text-white border-transparent " + saveHoverStyles,
    },
    done: {
      text: "Saved",
      classes: "bg-green-600 text-white border-transparent " + saveHoverStyles,
    },
    cancel: {
      text: "Cancel",
      classes: "bg-white text-gray-700 border-gray-300 " + cancelHoverStyles,
    },
  };

  const styles =
    basicStyles +
    (saveBtnStatuses[status]
      ? saveBtnStatuses[status].classes
      : defaultStyles + saveHoverStyles) +
    focusStyles +
    disabledStyles;

  return (
    <button
      onClick={callback}
      type={type}
      className={styles}
      disabled={disabled ? disabled : false}
      tabIndex={tabIndex}
    >
      {status && status === "inprogress" && <Loader />}
      {status && status === "loading" && <Loader />}
      {saveBtnStatuses[status] ? saveBtnStatuses[status].text : text}
    </button>
  );
}
