import React, { useId } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export default function Input({
  label,
  error,
  hint,
  leftIcon,
  rightIcon,
  fullWidth = true,
  className = "",
  id,
  ...props
}: InputProps) {
  // Deriving the id from the label breaks the moment two fields share one
  // ("Name" on both a shipping and a billing block). useId is unique per node.
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const messageId = `${inputId}-message`;

  return (
    <div className={fullWidth ? "w-full" : ""}>
      {label && (
        <label htmlFor={inputId} className="label">
          {label}
          {props.required && (
            <span className="ml-1 text-vermilion-600" aria-hidden>
              *
            </span>
          )}
        </label>
      )}

      <div className="relative">
        {leftIcon && (
          <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-ink-600">
            {leftIcon}
          </span>
        )}

        <input
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={error || hint ? messageId : undefined}
          {...props}
          className={`
            field
            ${error ? "field-invalid" : ""}
            ${leftIcon ? "pl-10" : ""}
            ${rightIcon ? "pr-10" : ""}
            ${className}
          `}
        />

        {rightIcon && (
          <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-ink-600">
            {rightIcon}
          </span>
        )}
      </div>

      {(error || hint) && (
        <p
          id={messageId}
          className={`mt-1.5 text-[13px] ${error ? "text-vermilion-700" : "text-ink-600"}`}
        >
          {error || hint}
        </p>
      )}
    </div>
  );
}
