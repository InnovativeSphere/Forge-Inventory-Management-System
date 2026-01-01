import { forwardRef } from "react";
import clsx from "clsx";
import { Spinner } from "./Spinner";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}

const baseStyles =
  "inline-flex items-center justify-center gap-2 select-none " +
  "interactive disabled:interactive-none";

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-[var(--color-accent)] text-white " +
    "hover:bg-[var(--color-accent-hover)] " +
    "shadow-sm",

  secondary:
    "bg-[var(--color-surface)] text-[var(--color-foreground)] " +
    "border border-[var(--color-border)] " +
    "hover:bg-[var(--color-secondary)]",

  ghost:
    "bg-transparent text-[var(--color-foreground)] " +
    "hover:bg-[var(--color-secondary)]",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-sm rounded-md",
  md: "h-10 px-4 text-sm rounded-md",
  lg: "h-12 px-6 text-base rounded-lg",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading = false,
      disabled,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={clsx(
          baseStyles,
          variantStyles[variant],
          sizeStyles[size],
          isDisabled && "opacity-60 cursor-not-allowed",
          className
        )}
        {...props}
      >
        {/* Keep width stable */}
        <span className={clsx(loading && "invisible")}>{children}</span>

        {loading && (
          <span className="absolute inline-flex">
            <Spinner />
          </span>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
