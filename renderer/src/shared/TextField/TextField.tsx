import { TextFieldProps } from "./types";

const TextField = ({
  id,
  type = "text",
  label,
  required = false,
  reference,
  ...props
}: TextFieldProps) => (
  <>
    {label && (
      <label
        htmlFor={id}
        className="block text-sm font-medium text-gray-700 dark:text-dark-main"
      >
        {label}
      </label>
    )}
    <input
      ref={reference}
      {...props}
      required={required}
      type={type}
      id={id}
      data-testid="text-field-test-id"
    />
  </>
);

export default TextField;
