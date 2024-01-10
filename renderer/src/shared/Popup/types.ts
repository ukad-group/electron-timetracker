import { buttonColors } from './constants';

export type PopupButton = {
  text: string;
  color: keyof typeof buttonColors;
  callback: () => void;
};

export type PopupProps = {
  title: string;
  description: string;
  top?: string;
  left?: string;
  buttons: PopupButton[];
};