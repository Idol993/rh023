import { type ReactNode } from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { clsx } from 'clsx';

export interface StatCardProps {
  title?: string;
  label?: string;
  value: string | number;
  unit?: string;
  icon?: ReactNode;
  iconBg?: string;
  iconColor?: string;
  trend?: {
    value: number | string;
    isUp?: boolean;
    direction?: 'up' | 'down' | 'neutral';
    label?: string;
  };
  description?: string;
  className?: string;
  onClick?: () => void;
}

export function StatCard({
  title,
  label,
  value,
  unit,
  icon,
  iconBg = 'bg-blue-50',
  iconColor = 'text-blue-600',
  trend,
  description,
  className,
  onClick,
}: StatCardProps) {
  const displayTitle = label ?? title ?? '';
  const isTrendUp = trend?.direction
    ? trend.direction === 'up'
    : trend?.isUp ?? true;
  return (
    <div
      onClick={onClick}
      className={clsx(
        'rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all',
        onClick && 'cursor-pointer hover:border-gray-300 hover:shadow-md',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-500">{displayTitle}</p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-gray-900">
            {value}
            {unit && <span className="ml-1 text-sm font-normal text-gray-500">{unit}</span>}
          </p>
          {trend ? (
            <div className="mt-2 flex items-center gap-1.5">
              <span
                className={clsx(
                  'inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-xs font-medium',
                  trend.direction === 'neutral'
                    ? 'bg-gray-100 text-gray-700'
                    : isTrendUp
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-red-50 text-red-700'
                )}
              >
                {trend.direction === 'neutral' ? null : isTrendUp ? (
                  <ArrowUpRight size={12} />
                ) : (
                  <ArrowDownRight size={12} />
                )}
                {typeof trend.value === 'number' ? `${trend.value}%` : trend.value}
              </span>
              {trend.label && (
                <span className="text-xs text-gray-500">{trend.label}</span>
              )}
            </div>
          ) : description ? (
            <p className="mt-2 text-xs text-gray-500">{description}</p>
          ) : null}
        </div>
        {icon && (
          <div
            className={clsx(
              'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl',
              iconBg,
              iconColor
            )}
          >
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}

export default StatCard;
