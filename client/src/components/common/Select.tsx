import React from 'react';

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
  className = '',
  id,
  ...props
}: SelectProps) {
  const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className={fullWidth ? 'w-full' : ''}>
      {label && (
        <label htmlFor={selectId} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <select
        id={selectId}
        {...props}
        className={`
          block rounded-lg border px-3 py-2 text-sm shadow-sm bg-white
          transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-0
          disabled:bg-gray-50 disabled:cursor-not-allowed
          ${error
            ? 'border-red-400 focus:border-red-400 focus:ring-red-300'
            : 'border-gray-300 focus:border-primary-500 focus:ring-primary-200'}
          ${fullWidth ? 'w-full' : ''}
          ${className}
        `}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
