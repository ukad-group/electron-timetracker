import { TextFieldProps } from "./types";

const TextField = ({
  id,
  type = "text",
  label,
  onKeyDown,
  onChange,
  onBlur,
  onFocus,
  onDragStart,
  className,
  value,
  required = false,
  tabIndex
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
      onKeyDown={onKeyDown}
      required={required}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      onFocus={onFocus}
      type={type}
      id={id}
      tabIndex={tabIndex}
      className={className}
      onDragStart={onDragStart}
      data-testid="text-field-test-id"
    />
  </>
)

export default TextField;

