import { ReactNode } from "react";

export type ButtonProps = {
  text: string;
  callback?: () => void;
  disabled?: boolean;
  status?: "enabled" | "disabled" | "inprogress" | "loading" | "done" | "cancel" | "default";
  type?: "button" | "submit" | "reset";
  tabIndex?: number;
  children?: ReactNode;
};
