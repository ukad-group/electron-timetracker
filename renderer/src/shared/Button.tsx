import Loader from "./Loader";
import { ReactNode } from "react";

type ButtonProps = {
  text: string;
  callback?: () => void;
  disabled?: boolean;
  status?: string;
  type?: "button" | "submit" | "reset";
  tabIndex?: number;
  children?: ReactNode;
};

const basicStyles =
  "inline-flex items-center justify-center px-4 py-2 gap-2 text-sm font-medium border rounded-md shadow-sm dark:border-dark-form-back ";
const defaultStyles = "bg-blue-600 text-white dark:bg-dark-button-back ";
const saveHoverStyles = "hover:bg-blue-700 hover:dark:bg-dark-button-hover ";
const cancelHoverStyles = "hover:bg-gray-50 ";
const focusStyles =
  "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:dark:border-focus-border focus:dark:ring-focus-border ";
const disabledStyles =
  "disabled:pointer-events-none disabled:bg-gray-300 disabled:dark:bg-gray-600 disabled:dark:border-dark-border ";

export default function Button({
  callback,
  text,
  disabled,
  status,
  type = "button",
  tabIndex,
  children,
}: ButtonProps) {
  const saveBtnStatuses = {
    enabled: {
      text: "Save",
      classes:
        "bg-blue-600 text-white border-transparent dark:bg-dark-button-back " +
        saveHoverStyles,
    },
    disabled: {
      text: "Save",
      classes: "bg-grey-600 text-white border-transparent " + saveHoverStyles,
    },
    inprogress: {
      text: "Saving...",
      classes:
        "bg-blue-600 text-white border-transparent dark:bg-dark-button-back " +
        saveHoverStyles,
    },
    loading: {
      text: "Loading",
      classes:
        "bg-blue-600 text-white border-transparent dark:bg-dark-button-back " +
        saveHoverStyles,
    },
    done: {
      text: "Saved",
      classes: "bg-green-600 text-white border-transparent " + saveHoverStyles,
    },
    cancel: {
      text: "Cancel",
      classes:
        "bg-white text-gray-700 border-gray-300 dark:bg-gray-200 " +
        cancelHoverStyles,
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
      {children}
      {status && status === "inprogress" && <Loader />}
      {status && status === "loading" && <Loader />}
      {saveBtnStatuses[status] ? saveBtnStatuses[status].text : text}
    </button>
  );
}
