import { useEffect, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { clsx } from 'clsx';
import Button from './Button';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  closeOnMaskClick?: boolean;
  showCloseButton?: boolean;
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
};

export function Modal({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  size = 'md',
  closeOnMaskClick = true,
  showCloseButton = true,
}: ModalProps) {
  useEffect(() => {
    if (!open) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={() => closeOnMaskClick && onClose()}
      />
      <div
        className={clsx(
          'relative z-10 w-full rounded-2xl bg-white shadow-2xl transition-all',
          sizeClasses[size]
        )}
      >
        {(title || subtitle || showCloseButton) && (
          <div className="flex items-start justify-between border-b border-gray-100 px-6 py-4">
            <div className="flex-1">
              {typeof title === 'string' ? (
                <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
              ) : (
                title
              )}
              {subtitle && (
                <p className="mt-1 text-xs text-gray-500">{subtitle}</p>
              )}
            </div>
            {showCloseButton && (
              <button
                type="button"
                onClick={onClose}
                className="ml-4 rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
            )}
          </div>
        )}
        <div className="px-6 py-5">{children}</div>
        {footer !== undefined && (
          <div className="flex items-center justify-end gap-2 border-t border-gray-100 px-6 py-4">
            {footer || (
              <Button variant="secondary" onClick={onClose}>
                关闭
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Modal;
