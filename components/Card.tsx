import clsx from "clsx";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
  padded?: boolean;
}

export function Card({
  interactive = false,
  padded = true,
  className,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={clsx(
        // Base card styling
        "rounded-lg bg-[var(--color-surface)] text-[var(--color-foreground)] " +
          "border border-[var(--color-border)] " +
          "shadow-sm shadow-black/10 " +
          "transition-all duration-200 ease-out",

        // Padding scales down on smaller viewports
        padded && "p-3 sm:p-4 md:p-5",

        // Interactive behavior
        interactive &&
          "cursor-pointer hover:shadow-md hover:-translate-y-[1px] active:translate-y-0",

        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
