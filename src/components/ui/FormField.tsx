import { forwardRef, type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes } from 'react';
import { clsx } from 'clsx';

interface FormFieldBaseProps {
  label?: ReactNode;
  error?: string;
  hint?: string;
  required?: boolean;
  className?: string;
  placeholder?: string;
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

interface FormFieldInputProps extends FormFieldBaseProps {
  type?: 'input' | 'textarea' | 'select';
  inputProps?: InputHTMLAttributes<HTMLInputElement>;
  textareaProps?: TextareaHTMLAttributes<HTMLTextAreaElement>;
  selectProps?: React.SelectHTMLAttributes<HTMLSelectElement>;
  children?: ReactNode;
}

export type FormFieldProps = FormFieldInputProps;

export const FormField = forwardRef<HTMLDivElement, FormFieldProps>(
  (
    {
      label,
      error,
      hint,
      required,
      className,
      type = 'input',
      inputProps,
      textareaProps,
      selectProps,
      children,
      leftIcon,
      rightIcon,
      placeholder,
      value,
      onChange,
    },
    ref
  ) => {
    const baseInputClass = clsx(
      'block w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-gray-900 transition-all',
      'placeholder:text-gray-400',
      'focus:outline-none focus:ring-2 focus:ring-offset-0',
      'disabled:bg-gray-50 disabled:text-gray-500',
      error
        ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500/20 hover:border-gray-400'
    );

    const renderField = () => {
      if (type === 'select') {
        return (
          <select {...selectProps} className={baseInputClass}>
            {children}
          </select>
        );
      }

      if (type === 'textarea') {
        return (
          <textarea
            {...textareaProps}
            placeholder={placeholder ?? textareaProps?.placeholder}
            value={value ?? textareaProps?.value}
            onChange={(onChange ?? textareaProps?.onChange) as React.ChangeEventHandler<HTMLTextAreaElement>}
            rows={textareaProps?.rows ?? 4}
            className={baseInputClass}
          />
        );
      }

      return (
        <div className="relative">
          {leftIcon && (
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
              {leftIcon}
            </div>
          )}
          <input
            {...inputProps}
            placeholder={placeholder ?? inputProps?.placeholder}
            value={value ?? inputProps?.value}
            onChange={(onChange ?? inputProps?.onChange) as React.ChangeEventHandler<HTMLInputElement>}
            className={clsx(baseInputClass, leftIcon && 'pl-10', rightIcon && 'pr-10')}
          />
          {rightIcon && (
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-gray-400">
              {rightIcon}
            </div>
          )}
        </div>
      );
    };

    return (
      <div ref={ref} className={clsx('w-full', className)}>
        {label && (
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            {label}
            {required && <span className="ml-0.5 text-red-500">*</span>}
          </label>
        )}
        {renderField()}
        {error ? (
          <p className="mt-1.5 text-xs text-red-600">{error}</p>
        ) : hint ? (
          <p className="mt-1.5 text-xs text-gray-500">{hint}</p>
        ) : null}
      </div>
    );
  }
);

FormField.displayName = 'FormField';

export default FormField;
