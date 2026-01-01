import clsx from 'clsx';

type LoaderSize = 'xs' | 'sm' | 'md' | 'lg';
type LoaderTone = 'default' | 'accent';

interface LoaderProps {
  size?: LoaderSize;
  tone?: LoaderTone;
  className?: string;
}

const sizeStyles: Record<LoaderSize, string> = {
  xs: 'h-3 w-3 border-2',
  sm: 'h-4 w-4 border-2',
  md: 'h-6 w-6 border-[3px]',
  lg: 'h-10 w-10 border-4',
};

const toneStyles: Record<LoaderTone, string> = {
  default:
    'border-[var(--color-muted)] border-t-[var(--color-foreground)]',
  accent:
    'border-[var(--color-accent)/30] border-t-[var(--color-accent)]',
};

export function Spinner({
  size = 'md',
  tone = 'default',
  className,
}: LoaderProps) {
  return (
    <span
      aria-label="Loading"
      className={clsx(
        'inline-block rounded-full animate-spin',
        sizeStyles[size],
        toneStyles[tone],
        className
      )}
    />
  );
}
