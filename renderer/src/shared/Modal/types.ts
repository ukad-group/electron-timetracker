export type ModalProps = {
  isOpen: boolean;
  children: React.ReactNode;
  onSubmit: (e: React.FormEvent) => void;
  title: string;
  onClose: () => void;
};
