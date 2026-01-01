import clsx from 'clsx';

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
        'card',
        padded && 'p-4 md:p-5',
        interactive && 'interactive cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
