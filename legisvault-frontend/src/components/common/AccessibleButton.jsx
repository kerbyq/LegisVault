import React from 'react';

/**
 * @typedef {Object} AccessibleButtonProps
 * @property {React.ReactNode} children - Button text or inner elements
 * @property {'primary'|'secondary'|'accent'|'danger'|'outline'|'ghost'} [variant='primary'] - Visual style
 * @property {'sm'|'md'|'lg'} [size='md'] - Button size (all maintain minimum touch targets)
 * @property {boolean} [isLoading=false] - Whether the button is in a loading state
 * @property {string} [loadingText='Processing...'] - Announced text when loading
 * @property {string} [ariaLabel] - Explicit accessible label for icon-only or shortened buttons
 * @property {React.ReactNode} [leftIcon] - Icon placed before text
 * @property {React.ReactNode} [rightIcon] - Icon placed after text
 * @property {boolean} [disabled=false] - Disabled state
 * @property {'button'|'submit'|'reset'} [type='button'] - Button HTML type
 * @property {string} [className] - Additional classes
 * @property {React.ButtonHTMLAttributes<HTMLButtonElement>} [props]
 */

/**
 * WCAG 2.2 Level AA Accessible Button Component
 * Ensures minimum 44x44px touch target, visible 3px teal focus ring,
 * screen reader loading announcements, and proper disabled attributes.
 */
export const AccessibleButton = React.forwardRef(({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  loadingText = 'Loading, please wait...',
  ariaLabel,
  leftIcon,
  rightIcon,
  disabled = false,
  type = 'button',
  className = '',
  onClick,
  ...props
}, ref) => {
  // WCAG 2.2 Compliant Color Schemes with >= 4.5:1 contrast
  const variantStyles = {
    primary: 'bg-primary text-white hover:bg-primary-600 active:bg-primary-700 border border-primary-700 shadow-sm',
    secondary: 'bg-secondary text-white hover:bg-secondary-600 active:bg-secondary-700 border border-secondary-800 shadow-sm',
    accent: 'bg-accent text-white hover:bg-primary-400 active:bg-primary-500 border border-accent shadow-sm',
    danger: 'bg-error-dark text-white hover:bg-red-800 active:bg-red-900 border border-red-900 shadow-sm',
    outline: 'bg-white text-secondary-500 border-2 border-secondary-400 hover:bg-surface active:bg-slate-200',
    ghost: 'bg-transparent text-secondary-500 hover:bg-slate-100 active:bg-slate-200 border border-transparent',
  };

  const sizeStyles = {
    sm: 'min-h-[44px] min-w-[44px] px-3 py-2 text-sm',
    md: 'min-h-[44px] min-w-[44px] px-4 py-2.5 text-base',
    lg: 'min-h-[48px] min-w-[48px] px-6 py-3 text-lg font-semibold',
  };

  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 select-none relative focus-ring disabled:opacity-60 disabled:cursor-not-allowed disabled:pointer-events-none';

  return (
    <button
      ref={ref}
      type={type}
      aria-label={ariaLabel}
      aria-busy={isLoading}
      aria-disabled={disabled || isLoading}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={`${baseStyles} ${variantStyles[variant] || variantStyles.primary} ${sizeStyles[size] || sizeStyles.md} ${className}`}
      {...props}
    >
      {isLoading ? (
        <>
          <svg
            className="animate-spin -ml-1 mr-2.5 h-5 w-5 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
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
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>{loadingText}</span>
          <span className="sr-only">Processing action</span>
        </>
      ) : (
        <>
          {leftIcon && <span className="mr-2 inline-flex items-center" aria-hidden="true">{leftIcon}</span>}
          <span>{children}</span>
          {rightIcon && <span className="ml-2 inline-flex items-center" aria-hidden="true">{rightIcon}</span>}
        </>
      )}
    </button>
  );
});

AccessibleButton.displayName = 'AccessibleButton';

export default AccessibleButton;
