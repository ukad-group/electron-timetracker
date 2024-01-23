export type TextFieldProps = {
  id: string;
  type?: string;
  label: string;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur: () => void;
  onFocus: (e: React.FocusEvent<HTMLInputElement>) => void;
  onDragStart: (e: React.DragEvent<HTMLInputElement>) => void;
  className: string;
  value: string;
  required?: boolean;
  tabIndex: number;
}