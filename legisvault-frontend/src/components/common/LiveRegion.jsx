import React from 'react';

/**
 * @typedef {Object} LiveRegionProps
 * @property {string} message - Announcement text
 * @property {'polite'|'assertive'|'off'} [politeness='polite'] - ARIA politeness level
 * @property {boolean} [visible=false] - Whether to render visibly or screen-reader only
 * @property {'info'|'success'|'warning'|'error'} [type='info'] - Visual type if visible
 * @property {string} [className] - Optional extra classes
 */

/**
 * WCAG 2.2 Level AA Live Region Component
 * Notifies screen reader users of asynchronous updates, search count changes,
 * or workflow completions without stealing active keyboard focus.
 */
export const LiveRegion = ({
  message,
  politeness = 'polite',
  visible = false,
  type = 'info',
  className = '',
}) => {
  if (!message) return null;

  if (!visible) {
    return (
      <div
        role={politeness === 'assertive' ? 'alert' : 'status'}
        aria-live={politeness}
        aria-atomic="true"
        className="sr-only"
      >
        {message}
      </div>
    );
  }

  const typeStyles = {
    info: 'bg-primary-50 text-primary-900 border-primary-300',
    success: 'bg-emerald-50 text-emerald-900 border-emerald-300',
    warning: 'bg-amber-50 text-amber-950 border-amber-300',
    error: 'bg-red-50 text-red-950 border-red-300',
  };

  return (
    <div
      role={politeness === 'assertive' ? 'alert' : 'status'}
      aria-live={politeness}
      aria-atomic="true"
      className={`p-3 rounded-lg border text-sm font-medium ${typeStyles[type]} ${className}`}
    >
      {message}
    </div>
  );
};

export default LiveRegion;
