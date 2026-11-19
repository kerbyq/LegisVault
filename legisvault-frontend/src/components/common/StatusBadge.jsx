import React from 'react';
import {
  DocumentTextIcon,
  CalendarDaysIcon,
  EyeIcon,
  CheckCircleIcon,
} from '@heroicons/react/20/solid';

/**
 * @typedef {Object} StatusBadgeProps
 * @property {'draft_received'|'calendared'|'first_reading'|'second_reading'|'third_reading_approval'|string} status - Reading workflow status
 * @property {string} [className] - Optional extra classes
 * @property {'sm'|'md'} [size='md'] - Badge sizing
 */

/**
 * WCAG 2.2 Level AA Multi-Signal Status Badge
 * Never relies on color alone (WCAG 1.4.1): Always couples distinct icon + semantic text + high-contrast colors.
 */
export const StatusBadge = ({ status, className = '', size = 'md' }) => {
  const normalizedStatus = (status || '').toLowerCase().trim();

  // Status configuration mapping
  const config = {
    draft_received: {
      label: 'Draft Received',
      icon: DocumentTextIcon,
      bgColor: 'bg-slate-100',
      textColor: 'text-slate-800',
      borderColor: 'border-slate-400',
      iconColor: 'text-slate-600',
    },
    calendared: {
      label: 'Calendared',
      icon: CalendarDaysIcon,
      bgColor: 'bg-sky-50',
      textColor: 'text-sky-900',
      borderColor: 'border-sky-400',
      iconColor: 'text-sky-700',
    },
    first_reading: {
      label: '1st Reading',
      icon: EyeIcon,
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-950',
      borderColor: 'border-amber-500',
      iconColor: 'text-amber-700',
    },
    second_reading: {
      label: '2nd Reading',
      icon: EyeIcon,
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-950',
      borderColor: 'border-orange-500',
      iconColor: 'text-orange-700',
    },
    third_reading_approval: {
      label: '3rd Reading Approval',
      icon: CheckCircleIcon,
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-950',
      borderColor: 'border-emerald-600',
      iconColor: 'text-emerald-700',
    },
  };

  const current = config[normalizedStatus] || {
    label: normalizedStatus.replace(/_/g, ' ') || 'Unknown',
    icon: DocumentTextIcon,
    bgColor: 'bg-slate-100',
    textColor: 'text-slate-800',
    borderColor: 'border-slate-300',
    iconColor: 'text-slate-500',
  };

  const IconComponent = current.icon;
  const isSm = size === 'sm';

  return (
    <span
      role="status"
      aria-label={`Status: ${current.label}`}
      className={`inline-flex items-center gap-1.5 font-semibold border rounded-full transition-colors ${
        isSm ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-xs sm:text-sm'
      } ${current.bgColor} ${current.textColor} ${current.borderColor} ${className}`}
    >
      <IconComponent className={`${isSm ? 'h-3.5 w-3.5' : 'h-4 w-4'} ${current.iconColor} shrink-0`} aria-hidden="true" />
      <span>{current.label}</span>
    </span>
  );
};

export default StatusBadge;
