import React, { useEffect } from 'react';
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
  XMarkIcon,
} from '@heroicons/react/20/solid';

/**
 * @typedef {Object} ToastProps
 * @property {string} message - Message body
 * @property {'success'|'error'|'info'|'warning'} [type='info'] - Notification type
 * @property {() => void} onClose - Dismiss handler
 * @property {number} [duration=5000] - Duration in ms (0 to disable auto-dismiss)
 */

/**
 * WCAG 2.2 Level AA Accessible Toast Notification
 * Uses role="alert" for high-priority errors, role="status" for informative messages,
 * combined color + icon + text feedback, and minimum 44px dismiss target.
 */
export const Toast = ({
  message,
  type = 'info',
  onClose,
  duration = 5000,
}) => {
  useEffect(() => {
    if (!duration || duration <= 0) return;
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const typeConfig = {
    success: {
      role: 'status',
      icon: CheckCircleIcon,
      bg: 'bg-emerald-50 border-emerald-500 text-emerald-950',
      iconColor: 'text-emerald-700',
    },
    error: {
      role: 'alert',
      icon: ExclamationCircleIcon,
      bg: 'bg-red-50 border-red-500 text-red-950',
      iconColor: 'text-red-700',
    },
    warning: {
      role: 'alert',
      icon: ExclamationCircleIcon,
      bg: 'bg-amber-50 border-amber-500 text-amber-950',
      iconColor: 'text-amber-700',
    },
    info: {
      role: 'status',
      icon: InformationCircleIcon,
      bg: 'bg-sky-50 border-sky-500 text-sky-950',
      iconColor: 'text-sky-700',
    },
  };

  const current = typeConfig[type] || typeConfig.info;
  const Icon = current.icon;

  return (
    <div
      role={current.role}
      aria-live={current.role === 'alert' ? 'assertive' : 'polite'}
      className={`fixed bottom-5 right-5 z-50 flex items-center justify-between gap-3 p-4 rounded-xl border-2 shadow-xl max-w-md animate-slide-up transition-all ${current.bg}`}
    >
      <div className="flex items-center gap-3">
        <Icon className={`h-6 w-6 shrink-0 ${current.iconColor}`} aria-hidden="true" />
        <p className="text-sm font-semibold">{message}</p>
      </div>

      <button
        type="button"
        onClick={onClose}
        aria-label="Dismiss notification"
        className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg p-2 hover:bg-black/5 focus-ring transition-colors"
      >
        <XMarkIcon className="h-5 w-5" aria-hidden="true" />
      </button>
    </div>
  );
};

export default Toast;
