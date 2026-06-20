import { clsx } from 'clsx';

type ProgressBarVariant = 'primary' | 'success' | 'warning' | 'danger';
type ProgressBarSize = 'sm' | 'md' | 'lg';

export interface ProgressBarProps {
  value?: number;
  progress?: number;
  max?: number;
  variant?: ProgressBarVariant;
  size?: ProgressBarSize;
  showLabel?: boolean;
  label?: string;
  className?: string;
}

const variantClasses: Record<ProgressBarVariant, string> = {
  primary: 'bg-blue-600',
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  danger: 'bg-red-500',
};

const sizeClasses: Record<ProgressBarSize, string> = {
  sm: 'h-1.5 rounded-full',
  md: 'h-2.5 rounded-full',
  lg: 'h-3.5 rounded-md',
};

export function ProgressBar({
  value,
  progress,
  max = 100,
  variant = 'primary',
  size = 'md',
  showLabel = false,
  label,
  className,
}: ProgressBarProps) {
  const resolvedValue = progress ?? value ?? 0;
  const percent = Math.min(100, Math.max(0, (resolvedValue / max) * 100));
  const displayLabel = label ?? `${Math.round(percent)}%`;

  return (
    <div className={clsx('w-full', className)}>
      {showLabel && (
        <div className="mb-1.5 flex items-center justify-between">
          <span className="text-xs font-medium text-gray-600">进度</span>
          <span className="text-xs font-semibold text-gray-900">{displayLabel}</span>
        </div>
      )}
      <div
        className={clsx(
          'w-full overflow-hidden bg-gray-100',
          sizeClasses[size]
        )}
        role="progressbar"
        aria-valuenow={resolvedValue}
        aria-valuemin={0}
        aria-valuemax={max}
      >
        <div
          className={clsx(
            'h-full transition-all duration-500 ease-out',
            variantClasses[variant]
          )}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

export default ProgressBar;
