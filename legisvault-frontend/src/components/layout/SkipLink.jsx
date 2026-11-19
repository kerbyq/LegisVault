import React from 'react';

/**
 * WCAG 2.2 Level AA Skip-to-Main-Content Link
 * Visually hidden until focused via keyboard navigation (Tab key).
 * Immediately allows keyboard and screen reader users to bypass repetitive navigation landmarks.
 */
export const SkipLink = ({ targetId = 'main-content', text = 'Skip to main content' }) => {
  const handleClick = (e) => {
    e.preventDefault();
    const target = document.getElementById(targetId);
    if (target) {
      target.setAttribute('tabindex', '-1');
      target.focus();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <a
      href={`#${targetId}`}
      onClick={handleClick}
      className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-6 focus:py-3 focus:bg-primary-900 focus:text-white focus:font-bold focus:rounded-lg focus:shadow-2xl focus:border-2 focus:border-white focus-ring text-base tracking-wide"
    >
      {text}
    </a>
  );
};

export default SkipLink;
