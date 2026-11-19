import React, { Fragment, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';

/**
 * @typedef {Object} AccessibleModalProps
 * @property {boolean} isOpen - Whether modal is visible
 * @property {() => void} onClose - Callback when modal is requested to close
 * @property {string} title - Accessible modal title
 * @property {string} [description] - Accessible modal description
 * @property {React.ReactNode} children - Modal content
 * @property {React.ReactNode} [footer] - Action buttons footer
 * @property {'sm'|'md'|'lg'|'xl'|'full'} [maxWidth='md'] - Max width breakpoint
 * @property {boolean} [hideCloseButton=false] - Whether to hide the top-right X button
 */

/**
 * WCAG 2.2 Level AA Accessible Modal Dialog
 * Implements role="dialog", aria-modal="true", aria-labelledby, aria-describedby,
 * automatic focus trapping, Escape key listener, and focus restoration.
 */
export const AccessibleModal = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  maxWidth = 'md',
  hideCloseButton = false,
}) => {
  const widthClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-6xl',
  };

  // Keyboard shortcut listener for Escape
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (isOpen && event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-50"
        onClose={onClose}
        aria-modal="true"
      >
        {/* Dimmed backdrop with 4.5:1 opacity contrast */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-secondary-900/70 backdrop-blur-xs transition-opacity" aria-hidden="true" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-150"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel
                className={`relative transform overflow-hidden rounded-xl bg-white text-left shadow-2xl transition-all sm:my-8 w-full ${widthClasses[maxWidth] || widthClasses.md} border border-slate-200`}
              >
                {/* Modal Header */}
                <div className="flex items-start justify-between border-b border-slate-200 px-6 py-4 bg-surface-muted/50">
                  <div className="pr-4">
                    <Dialog.Title
                      as="h2"
                      className="text-xl font-bold leading-6 text-secondary-500"
                    >
                      {title}
                    </Dialog.Title>
                    {description && (
                      <Dialog.Description className="mt-1 text-sm text-secondary-400">
                        {description}
                      </Dialog.Description>
                    )}
                  </div>

                  {!hideCloseButton && (
                    <button
                      type="button"
                      onClick={onClose}
                      aria-label={`Close ${title} dialog`}
                      className="min-h-[44px] min-w-[44px] rounded-lg p-2 text-secondary-400 hover:text-secondary-600 hover:bg-slate-200/60 focus-ring flex items-center justify-center transition-colors"
                    >
                      <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                      <span className="sr-only">Close dialog</span>
                    </button>
                  )}
                </div>

                {/* Modal Body */}
                <div className="px-6 py-5 text-secondary-500">
                  {children}
                </div>

                {/* Modal Footer */}
                {footer && (
                  <div className="border-t border-slate-200 bg-surface px-6 py-4 flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-3 gap-2">
                    {footer}
                  </div>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default AccessibleModal;
