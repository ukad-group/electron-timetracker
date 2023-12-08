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
      className="inline-flex items-center justify-center px-4 py-2 gap-2 text-sm font-medium rounded-md border shadow-sm dark:border-dark-form-border hover:underline text-gray-500 dark:text-dark-main"
    >
      {children}
    </button>
  );
}
