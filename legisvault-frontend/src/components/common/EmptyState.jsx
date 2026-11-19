import React from 'react';
import { FolderOpenIcon } from '@heroicons/react/24/outline';
import AccessibleButton from './AccessibleButton';

/**
 * @typedef {Object} EmptyStateProps
 * @property {string} title - Main header
 * @property {string} description - Explanatory message
 * @property {React.ReactNode} [icon] - Decorative icon
 * @property {string} [actionLabel] - CTA button label
 * @property {() => void} [onAction] - CTA button click handler
 * @property {string} [className] - Additional classes
 */

/**
 * WCAG 2.2 Level AA Accessible Empty State Component
 * Delivers descriptive feedback to assistive technology when datasets or queries return empty.
 */
export const EmptyState = ({
  title = 'No records found',
  description = 'There are no legislative documents or logs matching your criteria at this time.',
  icon,
  actionLabel,
  onAction,
  className = '',
}) => {
  return (
    <div
      role="region"
      aria-label={title}
      className={`flex flex-col items-center justify-center p-8 text-center rounded-xl border-2 border-dashed border-slate-300 bg-surface/50 my-4 ${className}`}
    >
      <div className="rounded-full bg-slate-100 p-4 text-secondary-400 mb-3" aria-hidden="true">
        {icon || <FolderOpenIcon className="h-10 w-10 text-primary-400" />}
      </div>
      <h3 className="text-lg font-bold text-secondary-500 mb-1">{title}</h3>
      <p className="text-sm text-secondary-400 max-w-md mb-5">{description}</p>
      {actionLabel && onAction && (
        <AccessibleButton
          variant="primary"
          size="md"
          onClick={onAction}
          ariaLabel={actionLabel}
        >
          {actionLabel}
        </AccessibleButton>
      )}
    </div>
  );
};

export default EmptyState;
