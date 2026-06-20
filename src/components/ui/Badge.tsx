import type { HTMLAttributes, ReactNode } from 'react';
import { clsx } from 'clsx';

type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral';
type BadgeSize = 'sm' | 'md' | 'lg';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  children: ReactNode;
  dot?: boolean;
  size?: BadgeSize;
}

const variantClasses: Record<BadgeVariant, string> = {
  success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  warning: 'bg-amber-50 text-amber-700 border-amber-200',
  danger: 'bg-red-50 text-red-700 border-red-200',
  info: 'bg-blue-50 text-blue-700 border-blue-200',
  neutral: 'bg-gray-50 text-gray-700 border-gray-200',
};

const dotClasses: Record<BadgeVariant, string> = {
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  danger: 'bg-red-500',
  info: 'bg-blue-500',
  neutral: 'bg-gray-400',
};

const sizeClasses: Record<BadgeSize, string> = {
  sm: 'px-1.5 py-0.5 text-[11px] gap-1',
  md: 'px-2 py-0.5 text-xs gap-1.5',
  lg: 'px-2.5 py-1 text-sm gap-2',
};

export function Badge({
  variant = 'neutral',
  children,
  dot = false,
  size = 'md',
  className,
  ...props
}: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-md border font-medium',
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {dot && (
        <span
          className={clsx(
            'h-1.5 w-1.5 shrink-0 rounded-full',
            dotClasses[variant]
          )}
        />
      )}
      {children}
    </span>
  );
}

export default Badge;
