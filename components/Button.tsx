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
  "relative inline-flex items-center justify-center gap-2 select-none " +
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] " +
  "transition-all duration-200 ease-out " +
  "disabled:pointer-events-none";

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-[var(--color-accent)] text-white " +
    "shadow-sm shadow-black/20 " +
    "hover:brightness-110 " +
    "active:scale-[0.98]",

  secondary:
    "bg-[var(--color-surface)] text-[var(--color-foreground)] " +
    "border border-[var(--color-border)] " +
    "hover:bg-[var(--color-secondary)] " +
    "active:scale-[0.98]",

  ghost:
    "bg-transparent text-[var(--color-foreground)] " +
    "hover:bg-[var(--color-secondary)] " +
    "active:scale-[0.97]",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm:
    "h-8 px-3 text-xs sm:text-sm rounded-md",
  md:
    "h-9 sm:h-10 px-4 text-sm rounded-md",
  lg:
    "h-11 sm:h-12 px-5 sm:px-6 text-sm sm:text-base rounded-lg",
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
