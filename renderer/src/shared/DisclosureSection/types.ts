import { ReactNode } from "react";
import { MutableRefObject } from "react";

export type DisclosureSectionProps = {
  reference?: MutableRefObject<any>;
  toggleFunction: () => void;
  isOpen: boolean;
  title: string;
  children: ReactNode;
};
