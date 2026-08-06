import React from "react";

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
  const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className={fullWidth ? "w-full" : ""}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-ink-700 mb-1.5"
        >
          {label}
          {props.required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-ink-400">
            {leftIcon}
          </div>
        )}
        <input
          id={inputId}
          {...props}
          className={`
            input-field
            ${error ? "border-red-400 focus:border-red-400 focus:ring-red-100" : ""}
            ${leftIcon ? "pl-10" : ""}
            ${rightIcon ? "pr-10" : ""}
            ${className}
          `}
        />
        {rightIcon && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-ink-400">
            {rightIcon}
          </div>
        )}
      </div>
      {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
      {!error && hint && <p className="mt-1.5 text-xs text-ink-400">{hint}</p>}
    </div>
  );
}
