type ButtonProps = {
  text: string;
  callback: () => void;
  disabled?: boolean;
};

export default function Button({ callback, text, disabled }: ButtonProps) {
  return (
    <button
      onClick={callback}
      type="button"
      className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:pointer-events-none disabled:bg-gray-300"
      disabled={disabled ? disabled : false}>
      {text}
    </button>
  );
}
