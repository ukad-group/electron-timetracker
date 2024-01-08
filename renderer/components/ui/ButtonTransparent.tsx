import { ReactNode } from "react";

type ButtonTransparentProps = {
  children: ReactNode;
  callback?: () => void;
};

export default function ButtonTransparent({
  children,
  callback,
}: ButtonTransparentProps) {
  return (
    <button
      onClick={callback}
      className="inline-flex items-center justify-center pl-2 pr-4 py-2 gap-2 text-sm font-medium rounded-md border shadow-sm hover:bg-gray-200 dark:border-dark-form-border  dark:hover:bg-dark-button-back-gray text-gray-500 dark:text-dark-main"
    >
      {children}
    </button>
  );
}
