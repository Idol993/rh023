import type { ReactNode } from 'react';
import { Inbox } from 'lucide-react';
import { clsx } from 'clsx';
import Button from './Button';

export interface EmptyStateProps {
  icon?: ReactNode;
  title?: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary';
  };
  compact?: boolean;
  className?: string;
}

export function EmptyState({
  icon,
  title = '暂无数据',
  description = '当前没有可用的数据，请稍后再试。',
  action,
  compact = false,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={clsx(
        'flex w-full flex-col items-center justify-center text-center',
        compact ? 'py-8' : 'py-16',
        className
      )}
    >
      <div
        className={clsx(
          'flex items-center justify-center rounded-full bg-gray-100 text-gray-400',
          compact ? 'h-12 w-12 mb-3' : 'h-16 w-16 mb-4'
        )}
      >
        {icon ?? <Inbox size={compact ? 24 : 32} />}
      </div>
      <h3
        className={clsx(
          'font-semibold text-gray-900',
          compact ? 'text-sm mb-1' : 'text-base mb-2'
        )}
      >
        {title}
      </h3>
      <p
        className={clsx(
          'max-w-sm text-gray-500',
          compact ? 'text-xs' : 'text-sm'
        )}
      >
        {description}
      </p>
      {action && (
        <Button
          className={compact ? 'mt-4' : 'mt-6'}
          variant={action.variant ?? 'primary'}
          size={compact ? 'sm' : 'md'}
          onClick={action.onClick}
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}

export default EmptyState;
