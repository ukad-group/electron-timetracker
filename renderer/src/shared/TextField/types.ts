import { MutableRefObject } from "react";

export type TextFieldProps = React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> & {
  id: string;
  label: string;
  reference?: MutableRefObject<any>;
};
