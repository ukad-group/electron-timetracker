import { ReactNode } from "react";

export type MenuItemProps = {
  children: ReactNode;
  callback?: () => void;
  isActive?: boolean;
};