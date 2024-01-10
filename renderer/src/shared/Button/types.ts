import { ReactNode } from "react";

export type ButtonProps = {
  text: string;
  callback?: () => void;
  disabled?: boolean;
  status?: string;
  type?: "button" | "submit" | "reset";
  tabIndex?: number;
  children?: ReactNode;
};