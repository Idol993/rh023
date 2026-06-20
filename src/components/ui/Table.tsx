import { type ReactNode } from 'react';
import { clsx } from 'clsx';

export interface Column<T> {
  key: string;
  title: ReactNode;
  header?: ReactNode;
  dataIndex?: keyof T;
  width?: string | number;
  align?: 'left' | 'center' | 'right';
  fixed?: 'left' | 'right';
  render?: (record: T, index: number) => ReactNode;
}

export interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  rowKey: keyof T | ((record: T) => string);
  loading?: boolean;
  emptyText?: ReactNode;
  striped?: boolean;
  hoverable?: boolean;
  onRowClick?: (record: T, index: number) => void;
  className?: string;
}

export function Table<T extends object>({
  columns,
  data,
  rowKey,
  loading = false,
  emptyText = '暂无数据',
  striped = true,
  hoverable = true,
  onRowClick,
  className,
}: TableProps<T>) {
  const getRowKey = (record: T, index: number): string => {
    if (typeof rowKey === 'function') return rowKey(record);
    return String(record[rowKey] ?? index);
  };

  const alignClass = (align?: 'left' | 'center' | 'right') => {
    switch (align) {
      case 'center':
        return 'text-center';
      case 'right':
        return 'text-right';
      default:
        return 'text-left';
    }
  };

  return (
    <div className={clsx('overflow-hidden rounded-xl border border-gray-200 bg-white', className)}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              {columns.map((col) => (
                <th
                  key={col.key}
                  style={{ width: col.width }}
                  className={clsx(
                    'px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 whitespace-nowrap',
                    alignClass(col.align)
                  )}
                >
                  {col.header ?? col.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12">
                  <div className="flex items-center justify-center gap-2 text-gray-400">
                    <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    <span className="text-sm">加载中...</span>
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12">
                  <div className="text-center text-sm text-gray-400">{emptyText}</div>
                </td>
              </tr>
            ) : (
              data.map((record, index) => (
                <tr
                  key={getRowKey(record, index)}
                  onClick={() => onRowClick?.(record, index)}
                  className={clsx(
                    striped && index % 2 === 1 && 'bg-gray-50/50',
                    hoverable && 'hover:bg-blue-50/50 transition-colors',
                    onRowClick && 'cursor-pointer'
                  )}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      style={{ width: col.width }}
                      className={clsx(
                        'px-4 py-3.5 text-sm text-gray-700 whitespace-nowrap',
                        alignClass(col.align)
                      )}
                    >
                      {col.render
                        ? col.render(record, index)
                        : col.dataIndex
                        ? String(record[col.dataIndex] ?? '')
                        : null}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Table;
