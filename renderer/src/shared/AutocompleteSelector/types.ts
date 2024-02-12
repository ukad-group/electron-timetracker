import { Dispatch, FormEvent, SetStateAction } from "react";

export type AutocompleteProps = {
  isNewCheck?: boolean;
  onSave: (e: FormEvent | MouseEvent) => void;
  title: string;
  selectedItem: string;
  availableItems: Array<string>;
  additionalItems?: Array<string>;
  setSelectedItem: Dispatch<SetStateAction<string>>;
  required?: boolean;
  tabIndex?: number;
  isValidationEnabled?: boolean;
  className?: string;
  showedSuggestionsNumber: number;
  spellCheck?: boolean;
};
