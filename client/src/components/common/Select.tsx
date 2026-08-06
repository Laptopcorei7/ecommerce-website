import React, { useId } from "react";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
  fullWidth?: boolean;
}

export default function Select({
  label,
  error,
  options,
  placeholder,
  fullWidth = true,
  className = "",
  id,
  ...props
}: SelectProps) {
  const generatedId = useId();
  const selectId = id ?? generatedId;
  const errorId = `${selectId}-error`;

  return (
    <div className={fullWidth ? "w-full" : ""}>
      {label && (
        <label htmlFor={selectId} className="label">
          {label}
        </label>
      )}

      <div className="relative">
        <select
          id={selectId}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          {...props}
          className={`
            field cursor-pointer appearance-none pr-9
            ${error ? "field-invalid" : ""}
            ${className}
          `}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>

        {/* The native arrow differs per platform; this one matches the rules. */}
        <svg
          aria-hidden
          viewBox="0 0 24 24"
          className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-600"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6" />
        </svg>
      </div>

      {error && (
        <p id={errorId} className="mt-1.5 text-[13px] text-vermilion-700">
          {error}
        </p>
      )}
    </div>
  );
}
