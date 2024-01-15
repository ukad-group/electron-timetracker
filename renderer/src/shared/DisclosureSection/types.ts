import { ReactNode } from "react";

export type DisclosureSectionProps = {
  toggleFunction: () => void;
  isOpen: boolean;
  title: string;
  children: ReactNode;
};