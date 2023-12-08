const buttonColors = {
  gray: "bg-white ring-1 ring-gray-300 text-gray-900 hover:bg-gray-50 dark:ring-gray-700 dark:text-dark-heading dark:bg-gray-500 hover:dark:bg-gray-400",
  green:
    "bg-green-600 hover:bg-green-500 dark:text-dark-heading dark:bg-green-600/70 hover:dark:bg-green-500/70",
  red: "bg-red-600 hover:bg-red-500 dark:text-dark-heading dark:bg-red-600/70 hover:dark:bg-red-500/70",
};

type PopupButton = {
  text: string;
  color: keyof typeof buttonColors;
  callback: () => void;
};

type PopupProps = {
  title: string;
  description: string;
  top?: string;
  left?: string;
  buttons: PopupButton[];
};

export default function Popup({
  title,
  description,
  top,
  left,
  buttons,
}: PopupProps) {
  return (
    <div
      style={{ top: `${top ? top : "0"}`, left: `${left ? left : "0"}` }}
      className="absolute p-4 z-10 animate-[scaling_0.5s_ease-in-out_forwards] overflow-hidden rounded-lg bg-white text-left shadow-2xl dark:bg-dark-container  dark:shadow-lg dark:shadow-slate-900"
    >
      <h3 className="text-base font-semibold leading-6 text-gray-900 dark:text-dark-heading">
        {title}
      </h3>
      <p className="text-sm text-gray-500 dark:text-dark-main mb-4">
        {description}
      </p>
      <div className="flex items-center justify-center gap-6">
        {buttons.map((button, i) => (
          <button
            key={i}
            onClick={button.callback}
            className={`${
              buttonColors[button.color]
            } inline-flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold shadow-sm ring-inset sm:mt-0 sm:w-auto`}
          >
            {button.text}
          </button>
        ))}
      </div>
    </div>
  );
}
