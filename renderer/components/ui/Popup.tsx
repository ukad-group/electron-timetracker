type PopupProps = {
  title: string;
  description: string;
  okCallback: () => void;
  cancelCallback: () => void;
  top?: string;
  left?: string;
};

export default function Popup({
  title,
  description,
  okCallback,
  cancelCallback,
  top,
  left,
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
        <button
          className="inline-flex w-full justify-center rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 sm:ml-3 sm:w-auto dark:text-dark-heading dark:bg-green-600/70 hover:dark:bg-green-500/70"
          onClick={okCallback}
        >
          Ok
        </button>
        <button
          onClick={cancelCallback}
          className="inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto dark:ring-gray-700 dark:text-dark-heading dark:bg-gray-500 hover:dark:bg-gray-400"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
