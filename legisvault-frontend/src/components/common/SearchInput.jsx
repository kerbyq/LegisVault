import React, { useRef } from 'react';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';

/**
 * @typedef {Object} SearchInputProps
 * @property {string} value - Current search value
 * @property {(value: string) => void} onChange - Callback when query updates
 * @property {() => void} [onClear] - Callback on clear
 * @property {() => void} [onSubmit] - Callback on Enter submit
 * @property {string} [placeholder='Search ordinances, resolutions, authors, keywords...'] - Placeholder text
 * @property {string} [ariaLabel='Search legislative repository'] - Accessible label
 * @property {boolean} [isLoading=false] - Whether query is executing
 * @property {string} [className] - Wrapper class
 */

/**
 * WCAG 2.2 Level AA Accessible Search Input Component
 * Provides explicit ARIA labelling, clear action with min 44px target,
 * loading spinner, and keyboard escape handling to quickly reset query.
 */
export const SearchInput = ({
  value,
  onChange,
  onClear,
  onSubmit,
  placeholder = 'Search ordinances, resolutions, authors, keywords...',
  ariaLabel = 'Search legislative repository',
  isLoading = false,
  className = '',
}) => {
  const inputRef = useRef(null);

  const handleKeyDown = (e) => {
    if (e.key === 'Escape' && value) {
      e.preventDefault();
      handleClear();
    } else if (e.key === 'Enter' && onSubmit) {
      e.preventDefault();
      onSubmit();
    }
  };

  const handleClear = () => {
    onChange('');
    if (onClear) onClear();
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div className={`relative flex items-center w-full ${className}`}>
      {/* Decorative Icon */}
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-secondary-400">
        <MagnifyingGlassIcon className="h-5 w-5" aria-hidden="true" />
      </div>

      <input
        ref={inputRef}
        type="search"
        role="searchbox"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        aria-label={ariaLabel}
        placeholder={placeholder}
        className="w-full min-h-[44px] rounded-lg border-2 border-slate-300 bg-white py-2.5 pl-11 pr-20 text-sm font-medium text-secondary-500 placeholder-slate-400 transition duration-150 hover:border-slate-400 focus-ring"
      />

      {/* Right controls: Loading spinner and Clear Button */}
      <div className="absolute inset-y-0 right-0 flex items-center pr-1.5 space-x-1">
        {isLoading && (
          <div role="status" aria-label="Searching records..." className="p-2">
            <svg
              className="animate-spin h-5 w-5 text-primary"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span className="sr-only">Searching records...</span>
          </div>
        )}

        {value && (
          <button
            type="button"
            onClick={handleClear}
            aria-label="Clear search input"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-md p-2 text-secondary-400 hover:text-secondary-600 hover:bg-slate-100 focus-ring transition-colors"
          >
            <XMarkIcon className="h-5 w-5" aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  );
};

export default SearchInput;
