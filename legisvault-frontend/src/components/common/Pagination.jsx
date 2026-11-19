import React from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/20/solid';

/**
 * @typedef {Object} PaginationProps
 * @property {number} currentPage - Active page number (1-indexed)
 * @property {number} totalPages - Total number of pages
 * @property {(page: number) => void} onPageChange - Callback when page changes
 * @property {number} [totalItems] - Optional count of total items
 * @property {number} [itemsPerPage=15] - Items per page
 * @property {string} [className] - Wrapper class
 */

/**
 * WCAG 2.2 Level AA Accessible Pagination Component
 * Uses nav landmark with aria-label, aria-current="page" indicator,
 * minimum 44px touch targets, and full keyboard navigation.
 */
export const Pagination = ({
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  totalItems,
  itemsPerPage = 15,
  className = '',
}) => {
  if (totalPages <= 1 && !totalItems) return null;

  // Generate visible page numbers with windowing
  const getPageNumbers = () => {
    const pages = [];
    const maxButtons = 5;

    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, start + maxButtons - 1);

    if (end - start < maxButtons - 1) {
      start = Math.max(1, end - maxButtons + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  const pages = getPageNumbers();
  const startItem = totalItems ? (currentPage - 1) * itemsPerPage + 1 : null;
  const endItem = totalItems ? Math.min(currentPage * itemsPerPage, totalItems) : null;

  return (
    <nav
      role="navigation"
      aria-label="Pagination Navigation"
      className={`flex flex-col sm:flex-row items-center justify-between gap-4 py-3 px-2 ${className}`}
    >
      {/* Item Range Summary */}
      {totalItems !== undefined && (
        <div className="text-sm text-secondary-400">
          Showing <span className="font-semibold text-secondary-500">{startItem}</span> to{' '}
          <span className="font-semibold text-secondary-500">{endItem}</span> of{' '}
          <span className="font-semibold text-secondary-500">{totalItems}</span> results
        </div>
      )}

      {/* Pagination Controls */}
      <div className="inline-flex items-center space-x-1">
        {/* Previous Page */}
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          aria-label="Go to previous page"
          className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white text-secondary-500 hover:bg-slate-50 focus-ring disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
          <span className="sr-only">Previous</span>
        </button>

        {/* First Page button if scrolled far */}
        {pages[0] > 1 && (
          <>
            <button
              type="button"
              onClick={() => onPageChange(1)}
              aria-label="Go to page 1"
              className="min-h-[44px] min-w-[44px] px-3 inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white text-sm font-medium text-secondary-500 hover:bg-slate-50 focus-ring transition-colors"
            >
              1
            </button>
            {pages[0] > 2 && (
              <span className="px-2 text-slate-400 select-none" aria-hidden="true">
                ...
              </span>
            )}
          </>
        )}

        {/* Numbered Page Buttons */}
        {pages.map((page) => {
          const isCurrent = page === currentPage;
          return (
            <button
              key={page}
              type="button"
              onClick={() => onPageChange(page)}
              aria-label={`Page ${page}`}
              aria-current={isCurrent ? 'page' : undefined}
              className={`min-h-[44px] min-w-[44px] px-3.5 inline-flex items-center justify-center rounded-lg text-sm font-semibold transition-all focus-ring ${
                isCurrent
                  ? 'bg-primary text-white border-2 border-primary-700 shadow-xs'
                  : 'border border-slate-300 bg-white text-secondary-500 hover:bg-slate-50'
              }`}
            >
              {page}
            </button>
          );
        })}

        {/* Last Page button if more remain */}
        {pages[pages.length - 1] < totalPages && (
          <>
            {pages[pages.length - 1] < totalPages - 1 && (
              <span className="px-2 text-slate-400 select-none" aria-hidden="true">
                ...
              </span>
            )}
            <button
              type="button"
              onClick={() => onPageChange(totalPages)}
              aria-label={`Go to page ${totalPages}`}
              className="min-h-[44px] min-w-[44px] px-3 inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white text-sm font-medium text-secondary-500 hover:bg-slate-50 focus-ring transition-colors"
            >
              {totalPages}
            </button>
          </>
        )}

        {/* Next Page */}
        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          aria-label="Go to next page"
          className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white text-secondary-500 hover:bg-slate-50 focus-ring disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
          <span className="sr-only">Next</span>
        </button>
      </div>
    </nav>
  );
};

export default Pagination;
