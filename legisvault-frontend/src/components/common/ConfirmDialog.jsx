import React, { Fragment, useRef, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import AccessibleButton from './AccessibleButton';

/**
 * @typedef {Object} ConfirmDialogProps
 * @property {boolean} isOpen - Whether confirmation is displayed
 * @property {() => void} onClose - Cancel/dismiss callback
 * @property {() => void} onConfirm - Confirm callback
 * @property {string} title - Accessible modal title
 * @property {string} message - Warning message details
 * @property {string} [confirmLabel='Confirm'] - Confirm button text
 * @property {string} [cancelLabel='Cancel'] - Cancel button text
 * @property {boolean} [isDestructive=false] - If true, emphasizes irreversible impact
 * @property {boolean} [isLoading=false] - Confirm button loading state
 */

/**
 * WCAG 2.2 Level AA Accessible Confirmation Alert Dialog
 * Implements role="alertdialog", aria-modal="true", traps focus onto Cancel button by default
 * to prevent accidental execution of destructive actions.
 */
export const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm Action',
  cancelLabel = 'Cancel',
  isDestructive = false,
  isLoading = false,
}) => {
  const cancelButtonRef = useRef(null);

  // Keyboard shortcut listener for Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isOpen && e.key === 'Escape' && !isLoading) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isLoading, onClose]);

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        role="alertdialog"
        initialFocus={cancelButtonRef}
        className="relative z-50"
        onClose={isLoading ? () => {} : onClose}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-secondary-900/75 backdrop-blur-xs transition-opacity" aria-hidden="true" />
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
              <Dialog.Panel className="relative transform overflow-hidden rounded-xl bg-white text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-lg p-6 border border-slate-200">
                <div className="sm:flex sm:items-start">
                  <div
                    className={`mx-auto flex h-12 w-12 shrink-0 items-center justify-center rounded-full sm:mx-0 sm:h-10 sm:w-10 ${
                      isDestructive ? 'bg-red-100 text-error-dark' : 'bg-primary-100 text-primary-700'
                    }`}
                    aria-hidden="true"
                  >
                    <ExclamationTriangleIcon className="h-6 w-6" />
                  </div>
                  <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                    <Dialog.Title as="h3" className="text-lg font-bold leading-6 text-secondary-500">
                      {title}
                    </Dialog.Title>
                    <div className="mt-2">
                      <p className="text-sm text-secondary-400">{message}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 sm:mt-5 sm:flex sm:flex-row-reverse gap-3">
                  <AccessibleButton
                    variant={isDestructive ? 'danger' : 'primary'}
                    onClick={onConfirm}
                    isLoading={isLoading}
                    ariaLabel={confirmLabel}
                    className="w-full sm:w-auto"
                  >
                    {confirmLabel}
                  </AccessibleButton>
                  <AccessibleButton
                    ref={cancelButtonRef}
                    variant="outline"
                    onClick={onClose}
                    disabled={isLoading}
                    ariaLabel={cancelLabel}
                    className="w-full sm:w-auto mt-2 sm:mt-0"
                  >
                    {cancelLabel}
                  </AccessibleButton>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default ConfirmDialog;
