import React, { forwardRef } from 'react';

/**
 * @typedef {Object} FormFieldProps
 * @property {string} id - Required unique ID
 * @property {string} label - Persistent visible label text
 * @property {string} [type='text'] - Input type (text, password, email, number, date, textarea, select)
 * @property {string} [placeholder] - Auxiliary hint (not substitute for label)
 * @property {string|number} [value] - Controlled value
 * @property {(e: any) => void} [onChange] - Change handler
 * @property {string} [error] - Error message
 * @property {string} [helperText] - Supplementary hint text
 * @property {boolean} [required=false] - Whether field is required
 * @property {boolean} [disabled=false] - Disabled state
 * @property {boolean} [readOnly=false] - Read-only state
 * @property {number} [rows=4] - Rows if textarea
 * @property {React.ReactNode} [children] - Options if type="select"
 * @property {React.ReactNode} [leftIcon] - Decorative left icon
 * @property {React.ReactNode} [rightElement] - Action element e.g. show/hide password
 * @property {string} [className] - Wrapper class
 * @property {React.InputHTMLAttributes<HTMLInputElement>} [props]
 */

/**
 * WCAG 2.2 Level AA Accessible FormField Component
 * Guarantees persistent visible label, aria-describedby association,
 * role="alert" error readout, minimum 44px target, and 3px teal focus ring.
 */
export const FormField = forwardRef(({
  id,
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  helperText,
  required = false,
  disabled = false,
  readOnly = false,
  rows = 4,
  children,
  leftIcon,
  rightElement,
  className = '',
  ...props
}, ref) => {
  const errorId = error ? `${id}-error` : undefined;
  const helperId = helperText ? `${id}-helper` : undefined;
  const describedBy = [errorId, helperId].filter(Boolean).join(' ') || undefined;

  const baseInputStyles = `w-full rounded-lg border-2 text-secondary-500 font-medium transition duration-150 focus-ring sm:text-sm ${
    error
      ? 'border-error bg-error-light/10 text-error-dark'
      : 'border-slate-300 bg-white hover:border-slate-400'
  } disabled:bg-slate-100 disabled:cursor-not-allowed disabled:text-slate-400 ${
    leftIcon ? 'pl-10' : 'pl-3.5'
  } ${rightElement ? 'pr-12' : 'pr-3.5'}`;

  return (
    <div className={`w-full ${className}`}>
      {/* Persistent Visible Label */}
      <label
        htmlFor={id}
        className="block text-sm font-semibold text-secondary-500 mb-1.5"
      >
        {label}
        {required && (
          <span className="text-error ml-1 font-bold" aria-hidden="true">
            *
          </span>
        )}
        {required && <span className="sr-only"> (required)</span>}
      </label>

      <div className="relative mt-1">
        {leftIcon && (
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-secondary-400">
            {leftIcon}
          </div>
        )}

        {type === 'textarea' ? (
          <textarea
            ref={ref}
            id={id}
            name={id}
            rows={rows}
            value={value}
            onChange={onChange}
            disabled={disabled}
            readOnly={readOnly}
            required={required}
            aria-required={required}
            aria-invalid={Boolean(error)}
            aria-describedby={describedBy}
            placeholder={placeholder}
            className={`${baseInputStyles} py-2.5 min-h-[88px]`}
            {...props}
          />
        ) : type === 'select' ? (
          <select
            ref={ref}
            id={id}
            name={id}
            value={value}
            onChange={onChange}
            disabled={disabled}
            required={required}
            aria-required={required}
            aria-invalid={Boolean(error)}
            aria-describedby={describedBy}
            className={`${baseInputStyles} min-h-[44px] py-2.5`}
            {...props}
          >
            {children}
          </select>
        ) : (
          <input
            ref={ref}
            id={id}
            name={id}
            type={type}
            value={value}
            onChange={onChange}
            disabled={disabled}
            readOnly={readOnly}
            required={required}
            aria-required={required}
            aria-invalid={Boolean(error)}
            aria-describedby={describedBy}
            placeholder={placeholder}
            className={`${baseInputStyles} min-h-[44px] py-2.5`}
            {...props}
          />
        )}

        {rightElement && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-2">
            {rightElement}
          </div>
        )}
      </div>

      {/* Helper Description */}
      {helperText && !error && (
        <p id={helperId} className="mt-1.5 text-xs text-secondary-400">
          {helperText}
        </p>
      )}

      {/* Dynamic Error Announcement */}
      {error && (
        <p
          id={errorId}
          role="alert"
          className="mt-1.5 text-sm font-semibold text-error flex items-center"
        >
          <span className="mr-1.5 text-base" aria-hidden="true">
            ⚠
          </span>
          <span>{error}</span>
        </p>
      )}
    </div>
  );
});

FormField.displayName = 'FormField';

export default FormField;
