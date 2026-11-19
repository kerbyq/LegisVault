import React from 'react';

/**
 * @typedef {Object} LoadingSpinnerProps
 * @property {'sm'|'md'|'lg'} [size='md'] - Spinner dimensions
 * @property {string} [label='Loading content, please wait...'] - Accessible label
 * @property {boolean} [showText=false] - Whether label is visibly displayed
 * @property {string} [className] - Optional container classes
 */

/**
 * WCAG 2.2 Level AA Accessible Loading Spinner
 * Explicitly exposes role="status" and aria-live announcements for assistive tech.
 */
export const LoadingSpinner = ({
  size = 'md',
  label = 'Loading, please wait...',
  showText = false,
  className = '',
}) => {
  const sizeClasses = {
    sm: 'h-5 w-5',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  return (
    <div
      role="status"
      aria-label={label}
      className={`inline-flex flex-col sm:flex-row items-center justify-center gap-3 ${className}`}
    >
      <svg
        className={`animate-spin text-primary ${sizeClasses[size] || sizeClasses.md}`}
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
      {showText ? (
        <span className="text-sm font-semibold text-secondary-500">{label}</span>
      ) : (
        <span className="sr-only">{label}</span>
      )}
    </div>
  );
};

export default LoadingSpinner;
