import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "brand";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const variantClasses = {
  primary:
    "bg-ink-950 text-white hover:bg-ink-800 focus:ring-ink-950/30 disabled:bg-ink-300",
  secondary:
    "bg-ink-100 text-ink-900 hover:bg-ink-200 focus:ring-ink-400/30 disabled:opacity-50",
  outline:
    "border border-ink-950 text-ink-950 hover:bg-ink-950 hover:text-white focus:ring-ink-950/30 disabled:opacity-50",
  ghost:
    "text-ink-700 hover:bg-ink-100 focus:ring-ink-400/30 disabled:opacity-50",
  danger:
    "bg-red-500 text-white hover:bg-red-600 focus:ring-red-400/30 disabled:bg-red-300",
  brand:
    "bg-brand-600 text-white hover:bg-brand-700 focus:ring-brand-500/30 disabled:bg-brand-300",
};

const sizeClasses = {
  sm: "px-3.5 py-1.5 text-xs",
  md: "px-5 py-2.5 text-sm",
  lg: "px-7 py-3.5 text-base",
};

export default function Button({
  variant = "primary",
  size = "md",
  isLoading = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  children,
  disabled,
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || isLoading}
      className={`
        inline-flex items-center justify-center gap-2 font-medium rounded-full
        transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2
        active:scale-95 disabled:cursor-not-allowed
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${fullWidth ? "w-full" : ""}
        ${className}
      `}
    >
      {isLoading ? (
        <svg
          className="animate-spin h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      ) : (
        leftIcon
      )}
      {children}
      {!isLoading && rightIcon}
    </button>
  );
}
