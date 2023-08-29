import Loader from "./Loader";

type ButtonProps = {
  text: string;
  callback: () => void;
  disabled?: boolean;
  status?: string;
};

export default function Button({ callback, text, disabled, status }: ButtonProps) {
  const saveBtnStatuses = {
    enabled: { text: "Save", classes: "bg-blue-600 "},
    disabled: { text: "Save", classes: "bg-grey-600 "},
    inprogress: { text: "Saving...", classes: "bg-blue-600 "},
    done: { text: "Saved", classes: "bg-green-600 "}
  }

  const basicStyles = "inline-flex items-center justify-center px-4 py-2 text-sm font-medium border border-transparent rounded-md shadow-sm text-white ";
  const defaultStyles = "bg-blue-600 ";
  const hoverStyles = "hover:bg-blue-700 ";
  const focusStyles = "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ";
  const disabledStyles = "disabled:pointer-events-none disabled:bg-gray-300 ";

  const styles =
      basicStyles +
      (saveBtnStatuses[status] ? saveBtnStatuses[status].classes : defaultStyles) +
      hoverStyles + focusStyles + disabledStyles;

  return (
    <button
      onClick={callback}
      type="button"
      className={ styles }
      disabled={disabled ? disabled : false}>
      {status && status === "inprogress" && <Loader/>}
      { saveBtnStatuses[status] ? saveBtnStatuses[status].text : text }
    </button>
  );
}