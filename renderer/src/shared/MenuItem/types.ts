import { ReactNode } from "react";

export type MenuItemProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  callback?: () => void;
  isActive?: boolean;
};
