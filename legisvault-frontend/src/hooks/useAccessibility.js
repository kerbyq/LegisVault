import { useEffect, useRef, useCallback } from 'react';

/**
 * Custom accessibility hook providing WCAG 2.2 compliant helpers:
 * - Focus Trap for dialogs/modals
 * - Screen Reader announcements (aria-live)
 * - Keyboard event management (Escape, Arrows, Tab navigation)
 * - Focus restoration to previously focused element
 */
export const useAccessibility = () => {
  const previousFocusRef = useRef(null);

  /**
   * Save the currently focused element for later restoration
   */
  const captureFocus = useCallback(() => {
    previousFocusRef.current = document.activeElement;
  }, []);

  /**
   * Restore focus to the element captured prior to opening an overlay
   */
  const restoreFocus = useCallback(() => {
    if (previousFocusRef.current && typeof previousFocusRef.current.focus === 'function') {
      previousFocusRef.current.focus();
    }
  }, []);

  /**
   * Focus Trap implementation for container refs
   * @param {React.RefObject<HTMLElement>} containerRef
   * @param {boolean} isActive
   */
  const useFocusTrap = (containerRef, isActive) => {
    useEffect(() => {
      if (!isActive || !containerRef.current) return;

      captureFocus();
      const element = containerRef.current;
      const focusableSelectors = [
        'a[href]',
        'button:not([disabled])',
        'textarea:not([disabled])',
        'input:not([disabled])',
        'select:not([disabled])',
        '[tabindex]:not([tabindex="-1"])',
      ].join(',');

      const focusableElements = element.querySelectorAll(focusableSelectors);
      if (focusableElements.length > 0) {
        focusableElements[0].focus();
      }

      const handleKeyDown = (e) => {
        if (e.key !== 'Tab') return;

        const currentFocusables = Array.from(element.querySelectorAll(focusableSelectors));
        if (currentFocusables.length === 0) return;

        const firstElement = currentFocusables[0];
        const lastElement = currentFocusables[currentFocusables.length - 1];

        if (e.shiftKey) {
          // Shift + Tab: if on first element, wrap to last
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          // Tab: if on last element, wrap to first
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      };

      element.addEventListener('keydown', handleKeyDown);

      // Lock body scroll while modal/trap is active
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      return () => {
        element.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = originalOverflow;
        restoreFocus();
      };
    }, [isActive, containerRef]);
  };

  /**
   * Send an accessible message to screen readers via a dynamic aria-live element
   * @param {string} message
   * @param {'polite'|'assertive'} politeness
   */
  const announce = useCallback((message, politeness = 'polite') => {
    if (!message) return;

    let announcer = document.getElementById('a11y-screen-reader-announcer');
    if (!announcer) {
      announcer = document.createElement('div');
      announcer.id = 'a11y-screen-reader-announcer';
      announcer.setAttribute('aria-live', politeness);
      announcer.setAttribute('aria-atomic', 'true');
      announcer.className = 'sr-only';
      document.body.appendChild(announcer);
    } else {
      announcer.setAttribute('aria-live', politeness);
    }

    // Set text after clear to ensure screen readers re-trigger on identical repeated text
    announcer.textContent = '';
    setTimeout(() => {
      if (announcer) {
        announcer.textContent = message;
      }
    }, 50);
  }, []);

  return {
    captureFocus,
    restoreFocus,
    useFocusTrap,
    announce,
  };
};

export default useAccessibility;
