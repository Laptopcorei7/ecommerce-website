import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** `brand` is the vermilion accent — reserve it for the single primary
   *  action on a screen (add to cart, place order). */
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "brand";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const variantClasses: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary: "bg-ink-950 text-paper-50 hover:bg-ink-800",
  secondary: "bg-ink-100 text-ink-950 hover:bg-ink-200",
  outline:
    "border border-ink-950/24 text-ink-950 hover:border-ink-950 hover:bg-ink-950 hover:text-paper-50",
  ghost: "text-ink-600 hover:bg-ink-950/5 hover:text-ink-950",
  danger: "bg-vermilion-700 text-paper-50 hover:bg-vermilion-600",
  brand: "bg-vermilion-600 text-paper-50 hover:bg-vermilion-700",
};

const sizeClasses: Record<NonNullable<ButtonProps["size"]>, string> = {
  sm: "h-9 px-4 text-[14px]",
  md: "h-11 px-6 text-[15px]",
  lg: "h-12 px-8 text-[15px]",
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
      aria-busy={isLoading || undefined}
      className={`
        inline-flex items-center justify-center gap-2 rounded-sm
        font-medium tracking-tight whitespace-nowrap
        transition-[background-color,color,border-color,transform] duration-200 ease-out
        active:translate-y-px
        disabled:opacity-40 disabled:pointer-events-none
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${fullWidth ? "w-full" : ""}
        ${className}
      `}
    >
      {isLoading ? <Spinner /> : leftIcon}
      {children}
      {!isLoading && rightIcon}
    </button>
  );
}

/** Hairline ring — matches the rule weight used everywhere else. */
function Spinner() {
  return (
    <span
      aria-hidden
      className="h-3.5 w-3.5 shrink-0 animate-spin rounded-full border border-current/30 border-t-current"
    />
  );
}
