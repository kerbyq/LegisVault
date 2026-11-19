import React, { Fragment } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid';

/**
 * @typedef {Object} DropdownOption
 * @property {string|number} value
 * @property {string} label
 * @property {string} [description]
 * @property {boolean} [disabled]
 */

/**
 * @typedef {Object} AccessibleDropdownProps
 * @property {string} id - HTML ID for the dropdown
 * @property {string} label - Persistent visible label
 * @property {DropdownOption[]} options - Array of select options
 * @property {string|number} value - Selected option value
 * @property {(value: string|number) => void} onChange - Change handler
 * @property {string} [placeholder='Select an option'] - Placeholder label
 * @property {string} [helperText] - Accessible helper description
 * @property {string} [error] - Accessible error text
 * @property {boolean} [required=false] - Whether field is required
 * @property {boolean} [disabled=false] - Disabled state
 * @property {string} [className] - Additional classes
 */

/**
 * WCAG 2.2 Level AA Accessible Dropdown Component
 * Built on @headlessui/react Listbox with arrow navigation,
 * aria-activedescendant, persistent label, and minimum 44px target height.
 */
export const AccessibleDropdown = ({
  id,
  label,
  options = [],
  value,
  onChange,
  placeholder = 'Select an option',
  helperText,
  error,
  required = false,
  disabled = false,
  className = '',
}) => {
  const selectedOption = options.find((opt) => opt.value === value) || null;
  const helperId = helperText ? `${id}-helper` : undefined;
  const errorId = error ? `${id}-error` : undefined;

  return (
    <div className={`w-full ${className}`}>
      <Listbox value={value} onChange={onChange} disabled={disabled}>
        {({ open }) => (
          <div>
            {/* Persistent Visible Label */}
            <Listbox.Label
              id={`${id}-label`}
              className="block text-sm font-semibold text-secondary-500 mb-1.5"
            >
              {label}
              {required && (
                <span className="text-error ml-1 font-bold" aria-hidden="true">
                  *
                </span>
              )}
              {required && <span className="sr-only"> (required)</span>}
            </Listbox.Label>

            <div className="relative mt-1">
              <Listbox.Button
                id={id}
                aria-labelledby={`${id}-label ${id}`}
                aria-describedby={[helperId, errorId].filter(Boolean).join(' ') || undefined}
                aria-invalid={Boolean(error)}
                className={`relative w-full min-h-[44px] cursor-pointer rounded-lg bg-white py-2.5 pl-3.5 pr-10 text-left border-2 transition duration-150 sm:text-sm focus-ring ${
                  error
                    ? 'border-error text-error-dark bg-error-light/10'
                    : 'border-slate-300 text-secondary-500 hover:border-slate-400'
                } disabled:bg-slate-100 disabled:cursor-not-allowed disabled:text-slate-400`}
              >
                <span className="block truncate font-medium">
                  {selectedOption ? selectedOption.label : <span className="text-slate-400">{placeholder}</span>}
                </span>
                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                  <ChevronUpDownIcon className="h-5 w-5 text-secondary-400" aria-hidden="true" />
                </span>
              </Listbox.Button>

              <Transition
                show={open}
                as={Fragment}
                leave="transition ease-in duration-100"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <Listbox.Options
                  static
                  className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-lg bg-white py-1 text-base shadow-xl ring-1 ring-black/10 focus:outline-none sm:text-sm border border-slate-200"
                >
                  {options.length === 0 ? (
                    <li className="relative cursor-default select-none py-3 px-4 text-slate-500 italic">
                      No options available
                    </li>
                  ) : (
                    options.map((option) => (
                      <Listbox.Option
                        key={option.value}
                        value={option.value}
                        disabled={option.disabled}
                        className={({ active, selected }) =>
                          `relative cursor-pointer select-none py-3 pl-10 pr-4 transition-colors min-h-[44px] flex flex-col justify-center ${
                            active ? 'bg-primary-50 text-primary-900 font-semibold' : 'text-secondary-500'
                          } ${selected ? 'bg-primary-100/60 font-bold' : ''} ${
                            option.disabled ? 'opacity-40 cursor-not-allowed' : ''
                          }`
                        }
                      >
                        {({ selected }) => (
                          <>
                            <span className={`block truncate ${selected ? 'font-semibold text-primary-900' : 'font-normal'}`}>
                              {option.label}
                            </span>
                            {option.description && (
                              <span className="text-xs text-secondary-400 block mt-0.5">
                                {option.description}
                              </span>
                            )}
                            {selected ? (
                              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-primary">
                                <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                <span className="sr-only">Selected</span>
                              </span>
                            ) : null}
                          </>
                        )}
                      </Listbox.Option>
                    ))
                  )}
                </Listbox.Options>
              </Transition>
            </div>

            {/* Helper Text */}
            {helperText && !error && (
              <p id={helperId} className="mt-1.5 text-xs text-secondary-400">
                {helperText}
              </p>
            )}

            {/* Error Message */}
            {error && (
              <p id={errorId} role="alert" className="mt-1.5 text-sm font-semibold text-error flex items-center">
                <span className="mr-1" aria-hidden="true">⚠</span>
                {error}
              </p>
            )}
          </div>
        )}
      </Listbox>
    </div>
  );
};

export default AccessibleDropdown;
