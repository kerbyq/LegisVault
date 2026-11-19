import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAccessibility } from '../hooks/useAccessibility';
import FormField from '../components/common/FormField';
import AccessibleDropdown from '../components/common/AccessibleDropdown';
import AccessibleButton from '../components/common/AccessibleButton';
import AccessibleTable from '../components/common/AccessibleTable';
import StatusBadge from '../components/common/StatusBadge';
import EmptyState from '../components/common/EmptyState';
import {
  MagnifyingGlassIcon,
  XMarkIcon,
  ArrowPathIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';

/**
 * Advanced Multi-Criteria Legislative Search Engine
 * Sub-2-minute query builder endpoint for all roles.
 * WCAG 2.2 Level AA: persistent visible field labels, removable filter pills,
 * live screen reader announcements, and high contrast search table.
 */
export const SearchPage = () => {
  const { announce } = useAccessibility();

  // Search Criteria State
  const [keyword, setKeyword] = useState('');
  const [documentType, setDocumentType] = useState('all');
  const [readingStatus, setReadingStatus] = useState('all');
  const [startYear, setStartYear] = useState('2020');
  const [endYear, setEndYear] = useState('2026');
  const [committeeId, setCommitteeId] = useState('all');
  const [committees, setCommittees] = useState([]);

  // Results State
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  // Fetch committee options
  useEffect(() => {
    const fetchCommittees = async () => {
      try {
        const res = await api.get('/committees');
        const list = res.data.data || res.data;
        if (Array.isArray(list)) setCommittees(list);
      } catch {
        setCommittees([
          { id: 1, name: 'Committee on Laws, Rules & Ordinances' },
          { id: 2, name: 'Committee on Appropriations' },
          { id: 3, name: 'Committee on Infrastructure & Public Works' },
          { id: 4, name: 'Committee on Health & Sanitation' },
          { id: 5, name: 'Committee on Education & Culture' },
        ]);
      }
    };
    fetchCommittees();
  }, []);

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setSearched(true);

    try {
      const params = {
        q: keyword || undefined,
        document_type: documentType !== 'all' ? documentType : undefined,
        reading_status: readingStatus !== 'all' ? readingStatus : undefined,
        start_year: startYear || undefined,
        end_year: endYear || undefined,
        committee_id: committeeId !== 'all' ? committeeId : undefined,
      };

      const response = await api.get('/search', { params });
      const data = response.data.data || response.data.documents || response.data;
      const count = response.data.meta?.total ?? (Array.isArray(data) ? data.length : 0);

      setResults(Array.isArray(data) ? data : []);
      setTotalCount(count);
      announce(`Search returned ${count} legislative measures.`, 'polite');
    } catch {
      // Offline fallback mock data
      const mockResults = [
        {
          id: 1,
          ordinance_number: 'Ord. No. 2026-089',
          title: 'An Ordinance Mandating Digital Archiving of All Legislative Measures in Naga City',
          author: 'Hon. Ma. Corazon San Jose',
          document_type: 'ordinance',
          reading_status: 'third_reading_approval',
          year_enacted: 2026,
          abstract: 'A comprehensive legislation standardizing digital records, WCAG 2.2 AA accessibility, and automated OCR pipelines for Sangguniang Panlungsod records.',
          committee: { name: 'Committee on Laws, Rules & Ordinances' },
        },
        {
          id: 3,
          ordinance_number: 'Ord. No. 2026-088',
          title: 'Naga City Traffic Code and Sustainable Active Mobility Framework',
          author: 'Hon. Salvador Mendoza',
          document_type: 'ordinance',
          reading_status: 'second_reading',
          year_enacted: 2026,
          abstract: 'Updated provisions for cycling lanes, pedestrian safety corridors, and automated traffic surveillance in Naga City urban district.',
          committee: { name: 'Committee on Infrastructure & Public Works' },
        },
      ];
      setResults(mockResults);
      setTotalCount(mockResults.length);
      announce(`Demo search returned ${mockResults.length} records.`, 'polite');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setKeyword('');
    setDocumentType('all');
    setReadingStatus('all');
    setStartYear('2020');
    setEndYear('2026');
    setCommitteeId('all');
    setResults([]);
    setSearched(false);
    setTotalCount(0);
    announce('Search filters reset to default.', 'polite');
  };

  // Active filter pills calculation
  const activeFilters = [];
  if (keyword) activeFilters.push({ label: `Query: "${keyword}"`, clear: () => setKeyword('') });
  if (documentType !== 'all') activeFilters.push({ label: `Type: ${documentType}`, clear: () => setDocumentType('all') });
  if (readingStatus !== 'all') activeFilters.push({ label: `Stage: ${readingStatus.replace(/_/g, ' ')}`, clear: () => setReadingStatus('all') });
  if (committeeId !== 'all') {
    const comm = committees.find((c) => String(c.id) === String(committeeId));
    activeFilters.push({ label: `Committee: ${comm ? comm.name : committeeId}`, clear: () => setCommitteeId('all') });
  }
  if (startYear !== '2020' || endYear !== '2026') {
    activeFilters.push({ label: `Years: ${startYear}–${endYear}`, clear: () => { setStartYear('2020'); setEndYear('2026'); } });
  }

  // Table columns
  const columns = [
    {
      key: 'ordinance_number',
      header: 'Measure #',
      className: 'w-36',
      render: (row) => (
        <Link
          to={`/documents/${row.id}`}
          className="font-bold text-primary hover:text-accent underline focus-ring rounded py-1 inline-block"
        >
          {row.ordinance_number}
        </Link>
      ),
    },
    {
      key: 'title',
      header: 'Title & Summary',
      render: (row) => (
        <div className="space-y-1">
          <p className="font-bold text-secondary-500">{row.title}</p>
          {row.abstract && (
            <p className="text-xs text-secondary-400 line-clamp-2">{row.abstract}</p>
          )}
          <span className="text-xs text-secondary-400 block">
            Author: <strong className="text-secondary-500">{row.author}</strong> | Committee: {row.committee?.name || 'General'}
          </span>
        </div>
      ),
    },
    {
      key: 'document_type',
      header: 'Type',
      className: 'w-28 capitalize',
      render: (row) => (
        <span className="inline-block px-2 py-0.5 rounded bg-slate-100 text-xs font-bold text-secondary-500 capitalize">
          {row.document_type}
        </span>
      ),
    },
    {
      key: 'reading_status',
      header: 'Reading Status',
      className: 'w-48',
      render: (row) => <StatusBadge status={row.reading_status} size="sm" />,
    },
    {
      key: 'actions',
      header: 'View',
      className: 'w-24 text-right',
      render: (row) => (
        <Link to={`/documents/${row.id}`}>
          <AccessibleButton variant="outline" size="sm" ariaLabel={`Open ${row.ordinance_number}`}>
            View
          </AccessibleButton>
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-8">
      {/* Title Header */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-secondary-500 tracking-tight">
          Advanced Legislative Search
        </h2>
        <p className="mt-1 text-sm text-secondary-400">
          Query the entire Sangguniang Panlungsod digital repository by metadata, committee, year, and full-text OCR indexing.
        </p>
      </div>

      {/* Multi-Criteria Form */}
      <form
        onSubmit={handleSearch}
        aria-label="Advanced Search Criteria"
        className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Keyword Search */}
          <div className="md:col-span-2 lg:col-span-3">
            <FormField
              id="search-keyword"
              label="Keywords or Full-Text Search"
              placeholder="e.g. Traffic management, digital archiving, Hon. Corazon, tax code..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              helperText="Searches title, author, ordinance number, abstract, and digitized OCR text."
              leftIcon={<MagnifyingGlassIcon className="h-5 w-5" />}
            />
          </div>

          {/* Document Type */}
          <div>
            <AccessibleDropdown
              id="search-type"
              label="Document Classification"
              value={documentType}
              onChange={setDocumentType}
              options={[
                { value: 'all', label: 'All Classifications' },
                { value: 'ordinance', label: 'Ordinances Only' },
                { value: 'resolution', label: 'Resolutions Only' },
                { value: 'motion', label: 'Motions Only' },
                { value: 'proclamation', label: 'Proclamations Only' },
              ]}
            />
          </div>

          {/* Reading Status */}
          <div>
            <AccessibleDropdown
              id="search-status"
              label="Reading Pipeline Stage"
              value={readingStatus}
              onChange={setReadingStatus}
              options={[
                { value: 'all', label: 'All Reading Stages' },
                { value: 'draft_received', label: 'Draft Received' },
                { value: 'calendared', label: 'Calendared' },
                { value: 'first_reading', label: '1st Reading' },
                { value: 'second_reading', label: '2nd Reading' },
                { value: 'third_reading_approval', label: '3rd Reading Approval' },
              ]}
            />
          </div>

          {/* Sponsoring Committee */}
          <div>
            <AccessibleDropdown
              id="search-committee"
              label="Sponsoring Committee"
              value={committeeId}
              onChange={setCommitteeId}
              options={[
                { value: 'all', label: 'All Committees' },
                ...committees.map((c) => ({ value: String(c.id), label: c.name })),
              ]}
            />
          </div>

          {/* Year Range */}
          <div>
            <FormField
              id="search-start-year"
              label="From Year (Enacted)"
              type="number"
              value={startYear}
              onChange={(e) => setStartYear(e.target.value)}
              min="1950"
              max="2030"
            />
          </div>

          <div>
            <FormField
              id="search-end-year"
              label="To Year (Enacted)"
              type="number"
              value={endYear}
              onChange={(e) => setEndYear(e.target.value)}
              min="1950"
              max="2030"
            />
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-3 pt-3 border-t border-slate-200">
          <AccessibleButton
            variant="outline"
            onClick={handleReset}
            leftIcon={<ArrowPathIcon className="h-5 w-5" />}
            ariaLabel="Reset all search filters"
          >
            Reset Criteria
          </AccessibleButton>

          <AccessibleButton
            type="submit"
            variant="primary"
            isLoading={loading}
            loadingText="Searching repository..."
            leftIcon={<FunnelIcon className="h-5 w-5" />}
            ariaLabel="Execute legislative search"
          >
            Execute Search
          </AccessibleButton>
        </div>
      </form>

      {/* Active Filter Pills Bar */}
      {activeFilters.length > 0 && (
        <section aria-label="Active Search Filters" className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold uppercase tracking-wider text-secondary-400">
            Active Filters:
          </span>
          {activeFilters.map((f, i) => (
            <span
              key={i}
              className="inline-flex items-center rounded-full bg-primary-100 text-primary-900 text-xs font-semibold pl-3 pr-1 py-1 border border-primary-300"
            >
              <span>{f.label}</span>
              <button
                type="button"
                onClick={f.clear}
                aria-label={`Remove filter: ${f.label}`}
                className="min-h-[28px] min-w-[28px] ml-1 inline-flex items-center justify-center rounded-full text-primary-700 hover:text-primary-900 hover:bg-primary-200 focus-ring"
              >
                <XMarkIcon className="h-4 w-4" aria-hidden="true" />
              </button>
            </span>
          ))}
          <button
            type="button"
            onClick={handleReset}
            className="text-xs font-bold text-error underline hover:text-red-800 focus-ring rounded px-2 py-1"
          >
            Clear All
          </button>
        </section>
      )}

      {/* Search Results Area */}
      <section aria-label="Search Results">
        {searched && (
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-bold text-secondary-500">
              Search Results ({totalCount} measure{totalCount === 1 ? '' : 's'} found)
            </h3>
          </div>
        )}

        {searched && results.length === 0 && !loading && (
          <EmptyState
            title="No Legislative Records Found"
            description="No documents matched the specified combination of keywords, filters, and year boundaries. Try expanding the year range or removing keyword filters."
            actionLabel="Reset Search Filters"
            onAction={handleReset}
          />
        )}

        {results.length > 0 && (
          <AccessibleTable
            caption="Advanced Legislative Query Results"
            columns={columns}
            data={results}
            keyField="id"
            isLoading={loading}
          />
        )}
      </section>
    </div>
  );
};

export default SearchPage;
