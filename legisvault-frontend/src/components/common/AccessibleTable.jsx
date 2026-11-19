import React from 'react';
import { ChevronUpIcon, ChevronDownIcon, ArrowsUpDownIcon } from '@heroicons/react/20/solid';

/**
 * @typedef {Object} TableColumn
 * @property {string} key - Column identifier
 * @property {string} header - Visible header text
 * @property {boolean} [sortable] - Whether column can be sorted
 * @property {string} [className] - Optional custom cell classes
 * @property {(item: any, index: number) => React.ReactNode} [render] - Custom cell renderer
 */

/**
 * @typedef {Object} AccessibleTableProps
 * @property {string} caption - Table caption for assistive technologies
 * @property {TableColumn[]} columns - Table column definitions
 * @property {any[]} data - Data records
 * @property {string} [keyField='id'] - Unique record key
 * @property {string} [sortField] - Active sorted field key
 * @property {'asc'|'desc'} [sortDirection='asc'] - Active sort direction
 * @property {(field: string) => void} [onSort] - Sort callback
 * @property {boolean} [selectable=false] - Whether row checkboxes are active
 * @property {Set<string|number>|Array<string|number>} [selectedKeys=[]] - Set of selected record IDs
 * @property {(keys: any[]) => void} [onSelectChange] - Callback when selection changes
 * @property {boolean} [isLoading=false] - Loading indicator state
 * @property {string} [emptyMessage='No records found.'] - Empty state message
 * @property {string} [className] - Table wrapper class
 */

/**
 * WCAG 2.2 Level AA Accessible Data Table Component
 * Features th scope="col", row scope="row", aria-sort, keyboard scrollable container,
 * and high contrast row selection with explicit accessible labels.
 */
export const AccessibleTable = ({
  caption,
  columns,
  data = [],
  keyField = 'id',
  sortField,
  sortDirection = 'asc',
  onSort,
  selectable = false,
  selectedKeys = [],
  onSelectChange,
  isLoading = false,
  emptyMessage = 'No records found.',
  className = '',
}) => {
  const selectedSet = new Set(selectedKeys);
  const allSelected = data.length > 0 && data.every((row) => selectedSet.has(row[keyField]));
  const someSelected = data.length > 0 && !allSelected && data.some((row) => selectedSet.has(row[keyField]));

  const handleSelectAll = (e) => {
    if (!onSelectChange) return;
    if (e.target.checked) {
      onSelectChange(data.map((item) => item[keyField]));
    } else {
      onSelectChange([]);
    }
  };

  const handleSelectRow = (key) => {
    if (!onSelectChange) return;
    const newSelected = new Set(selectedSet);
    if (newSelected.has(key)) {
      newSelected.delete(key);
    } else {
      newSelected.add(key);
    }
    onSelectChange(Array.from(newSelected));
  };

  return (
    <div className={`w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs ${className}`}>
      {/* Keyboard accessible scroll container (WCAG 2.1.1 / 2.2 Scrollable Regions) */}
      <div
        tabIndex={0}
        role="region"
        aria-label={`${caption} - Use arrow keys to scroll table`}
        className="overflow-x-auto focus-ring"
      >
        <table className="min-w-full divide-y divide-slate-200 text-left text-sm text-secondary-500">
          <caption className="sr-only">{caption}</caption>

          <thead className="bg-surface-muted text-xs font-bold uppercase tracking-wider text-secondary-500">
            <tr>
              {selectable && (
                <th scope="col" className="w-12 px-4 py-3.5 text-center">
                  <div className="flex items-center justify-center min-h-[44px]">
                    <label className="sr-only" htmlFor="select-all-checkbox">
                      Select all rows in {caption}
                    </label>
                    <input
                      id="select-all-checkbox"
                      type="checkbox"
                      checked={allSelected}
                      ref={(el) => {
                        if (el) el.indeterminate = someSelected;
                      }}
                      onChange={handleSelectAll}
                      aria-label={`Select all rows in ${caption}`}
                      className="h-5 w-5 rounded border-slate-300 text-primary focus-ring cursor-pointer"
                    />
                  </div>
                </th>
              )}

              {columns.map((col, index) => {
                const isSorted = sortField === col.key;
                const ariaSortValue = !col.sortable
                  ? undefined
                  : isSorted
                  ? sortDirection === 'asc'
                    ? 'ascending'
                    : 'descending'
                  : 'none';

                return (
                  <th
                    key={col.key || index}
                    scope="col"
                    aria-sort={ariaSortValue}
                    className={`px-4 py-3.5 font-bold text-secondary-500 ${col.className || ''}`}
                  >
                    {col.sortable && onSort ? (
                      <button
                        type="button"
                        onClick={() => onSort(col.key)}
                        aria-label={`Sort by ${col.header}, currently ${
                          ariaSortValue === 'none' ? 'unsorted' : ariaSortValue
                        }`}
                        className="group inline-flex items-center space-x-1.5 min-h-[44px] py-1 text-left uppercase focus-ring rounded px-1.5 -ml-1.5 hover:text-primary transition-colors"
                      >
                        <span>{col.header}</span>
                        <span className="text-secondary-400 group-hover:text-primary">
                          {isSorted ? (
                            sortDirection === 'asc' ? (
                              <ChevronUpIcon className="h-4 w-4 text-primary font-bold" aria-hidden="true" />
                            ) : (
                              <ChevronDownIcon className="h-4 w-4 text-primary font-bold" aria-hidden="true" />
                            )
                          ) : (
                            <ArrowsUpDownIcon className="h-4 w-4 opacity-50 group-hover:opacity-100" aria-hidden="true" />
                          )}
                        </span>
                      </button>
                    ) : (
                      <span className="inline-block py-2">{col.header}</span>
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 bg-white">
            {isLoading ? (
              <tr>
                <td
                  colSpan={columns.length + (selectable ? 1 : 0)}
                  className="px-6 py-12 text-center text-secondary-400"
                >
                  <div className="flex flex-col items-center justify-center space-y-3" role="status">
                    <svg
                      className="animate-spin h-8 w-8 text-primary"
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
                    <span className="text-sm font-medium">Loading records from repository...</span>
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (selectable ? 1 : 0)}
                  className="px-6 py-12 text-center text-secondary-400 font-medium italic"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => {
                const rowKey = row[keyField] ?? rowIndex;
                const isSelected = selectedSet.has(rowKey);

                return (
                  <tr
                    key={rowKey}
                    className={`transition-colors hover:bg-slate-50/80 ${
                      isSelected ? 'bg-primary-50/50' : rowIndex % 2 === 1 ? 'bg-slate-50/30' : 'bg-white'
                    }`}
                  >
                    {selectable && (
                      <td className="w-12 px-4 py-3 text-center">
                        <div className="flex items-center justify-center min-h-[44px]">
                          <input
                            id={`row-select-${rowKey}`}
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleSelectRow(rowKey)}
                            aria-label={`Select row ${row.ordinance_number || row.title || rowKey}`}
                            className="h-5 w-5 rounded border-slate-300 text-primary focus-ring cursor-pointer"
                          />
                        </div>
                      </td>
                    )}

                    {columns.map((col, colIndex) => {
                      const cellContent = col.render ? col.render(row, rowIndex) : row[col.key];

                      // Designate the first non-selection cell as row header for accessible table semantics
                      if (colIndex === 0) {
                        return (
                          <th
                            key={col.key || colIndex}
                            scope="row"
                            className={`px-4 py-3.5 font-semibold text-secondary-500 ${col.className || ''}`}
                          >
                            {cellContent}
                          </th>
                        );
                      }

                      return (
                        <td
                          key={col.key || colIndex}
                          className={`px-4 py-3.5 text-secondary-500 ${col.className || ''}`}
                        >
                          {cellContent}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AccessibleTable;
