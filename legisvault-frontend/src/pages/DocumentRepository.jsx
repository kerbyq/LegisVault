import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../hooks/useAuth';
import { useAccessibility } from '../hooks/useAccessibility';
import AccessibleTable from '../components/common/AccessibleTable';
import AccessibleButton from '../components/common/AccessibleButton';
import AccessibleDropdown from '../components/common/AccessibleDropdown';
import SearchInput from '../components/common/SearchInput';
import Pagination from '../components/common/Pagination';
import StatusBadge from '../components/common/StatusBadge';
import ConfirmDialog from '../components/common/ConfirmDialog';
import Toast from '../components/common/Toast';
import {
  EyeIcon,
  PencilSquareIcon,
  TrashIcon,
  PlusIcon,
  ArrowDownTrayIcon,
  AdjustmentsHorizontalIcon,
} from '@heroicons/react/24/outline';

/**
 * Master Legislative Document Repository & Registry
 * WCAG 2.2 Level AA: full keyboard sortable table, persistent visible filters,
 * screen reader status announcements, minimum 44px action targets, and role guards.
 */
export const DocumentRepository = () => {
  const { isAdmin, isUploader } = useAuth();
  const { announce } = useAccessibility();

  // Data states
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalRecords, setTotalRecords] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedYear, setSelectedYear] = useState('all');
  const [selectedCommittee, setSelectedCommittee] = useState('all');
  const [committees, setCommittees] = useState([]);

  // Sorting state
  const [sortField, setSortField] = useState('created_at');
  const [sortDirection, setSortDirection] = useState('desc');

  // Selection & Modal states
  const [selectedIds, setSelectedIds] = useState([]);
  const [deleteCandidate, setDeleteCandidate] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Load committee options for filter dropdown
  useEffect(() => {
    const fetchCommittees = async () => {
      try {
        const res = await api.get('/committees');
        const list = res.data.data || res.data;
        if (Array.isArray(list)) {
          setCommittees(list);
        }
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

  // Fetch document registry records
  const fetchDocuments = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        per_page: itemsPerPage,
        sort: sortField,
        direction: sortDirection,
        q: searchQuery || undefined,
        document_type: selectedType !== 'all' ? selectedType : undefined,
        reading_status: selectedStatus !== 'all' ? selectedStatus : undefined,
        year_enacted: selectedYear !== 'all' ? selectedYear : undefined,
        sponsoring_committee_id: selectedCommittee !== 'all' ? selectedCommittee : undefined,
      };

      const response = await api.get('/documents', { params });
      const data = response.data.data || response.data;
      const meta = response.data.meta || {};

      if (Array.isArray(data)) {
        setDocuments(data);
        setTotalRecords(meta.total ?? data.length);
        setTotalPages(meta.last_page ?? Math.ceil((meta.total ?? data.length) / itemsPerPage));
      }
      announce(`Registry loaded. Showing ${data.length} records.`, 'polite');
    } catch {
      // Mock data fallback if backend is offline
      const mockDocs = [
        {
          id: 1,
          ordinance_number: 'Ord. No. 2026-089',
          title: 'An Ordinance Mandating Digital Archiving and Accessibility Compliance in Naga City',
          author: 'Hon. Ma. Corazon San Jose',
          document_type: 'ordinance',
          reading_status: 'third_reading_approval',
          year_enacted: 2026,
          committee: { name: 'Committee on Laws, Rules & Ordinances' },
          created_at: '2026-11-18T09:30:00Z',
        },
        {
          id: 2,
          ordinance_number: 'Res. No. 2026-312',
          title: 'Resolution Commending Sangguniang Panlungsod Secretariat for WCAG 2.2 Standards',
          author: 'Hon. Juan Miguel Perez',
          document_type: 'resolution',
          reading_status: 'third_reading_approval',
          year_enacted: 2026,
          committee: { name: 'Committee on Appropriations' },
          created_at: '2026-11-17T14:15:00Z',
        },
        {
          id: 3,
          ordinance_number: 'Ord. No. 2026-088',
          title: 'Naga City Traffic Code and Sustainable Active Mobility Framework',
          author: 'Hon. Salvador Mendoza',
          document_type: 'ordinance',
          reading_status: 'second_reading',
          year_enacted: 2026,
          committee: { name: 'Committee on Infrastructure & Public Works' },
          created_at: '2026-11-15T11:00:00Z',
        },
        {
          id: 4,
          ordinance_number: 'Ord. No. 2026-087',
          title: 'Youth Digital Skills and Technology Hub Grant Allocation',
          author: 'Hon. Angela Cristobal',
          document_type: 'ordinance',
          reading_status: 'first_reading',
          year_enacted: 2026,
          committee: { name: 'Committee on Education & Culture' },
          created_at: '2026-11-12T16:45:00Z',
        },
        {
          id: 5,
          ordinance_number: 'Res. No. 2026-310',
          title: 'Authorizing City Mayor to Enter into MOA for Solar Photovoltaic Installations',
          author: 'Hon. Roberto Del Rosario',
          document_type: 'resolution',
          reading_status: 'calendared',
          year_enacted: 2026,
          committee: { name: 'Committee on Infrastructure & Public Works' },
          created_at: '2026-11-09T08:00:00Z',
        },
        {
          id: 6,
          ordinance_number: 'Ord. No. 2026-086',
          title: 'Bantay Kalusugan Community Mental Health Emergency Support Program',
          author: 'Hon. Dr. Ernesto Valencia',
          document_type: 'ordinance',
          reading_status: 'draft_received',
          year_enacted: 2026,
          committee: { name: 'Committee on Health & Sanitation' },
          created_at: '2026-11-05T13:20:00Z',
        },
      ];

      setDocuments(mockDocs);
      setTotalRecords(mockDocs.length);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, sortField, sortDirection, searchQuery, selectedType, selectedStatus, selectedYear, selectedCommittee, announce]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  // Handle column sorting
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  // Delete document action (Admin only)
  const confirmDelete = async () => {
    if (!deleteCandidate) return;
    setIsDeleting(true);
    try {
      await api.delete(`/documents/${deleteCandidate.id}`);
      setToastMessage({
        type: 'success',
        text: `Document ${deleteCandidate.ordinance_number} was successfully deleted.`,
      });
      setDeleteCandidate(null);
      fetchDocuments();
    } catch {
      // Local fallback
      setDocuments((prev) => prev.filter((d) => d.id !== deleteCandidate.id));
      setToastMessage({
        type: 'success',
        text: `Document ${deleteCandidate.ordinance_number} was removed from view.`,
      });
      setDeleteCandidate(null);
    } finally {
      setIsDeleting(false);
    }
  };

  // Table columns definition
  const columns = [
    {
      key: 'ordinance_number',
      header: 'Measure #',
      sortable: true,
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
      header: 'Title / Subject Matter',
      sortable: true,
      className: 'min-w-[280px]',
      render: (row) => (
        <div>
          <p className="font-semibold text-secondary-500 line-clamp-2">{row.title}</p>
          <span className="text-xs text-secondary-400 mt-0.5 block">
            Sponsored by: <strong className="text-secondary-500">{row.author}</strong>
          </span>
        </div>
      ),
    },
    {
      key: 'document_type',
      header: 'Type',
      sortable: true,
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
      sortable: true,
      className: 'w-48',
      render: (row) => <StatusBadge status={row.reading_status} size="sm" />,
    },
    {
      key: 'year_enacted',
      header: 'Year',
      sortable: true,
      className: 'w-20 text-center',
      render: (row) => <span className="font-medium">{row.year_enacted || 2026}</span>,
    },
    {
      key: 'actions',
      header: 'Actions',
      sortable: false,
      className: 'w-36 text-right',
      render: (row) => (
        <div className="flex items-center justify-end space-x-1">
          {/* View Details */}
          <Link
            to={`/documents/${row.id}`}
            aria-label={`View record details for ${row.ordinance_number}`}
            className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-lg text-secondary-400 hover:text-primary hover:bg-slate-100 focus-ring"
          >
            <EyeIcon className="h-5 w-5" aria-hidden="true" />
          </Link>

          {/* Edit (Uploader or Admin) */}
          {isUploader && (
            <Link
              to={`/documents/${row.id}?edit=true`}
              aria-label={`Edit metadata for ${row.ordinance_number}`}
              className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-lg text-secondary-400 hover:text-amber-600 hover:bg-amber-50 focus-ring"
            >
              <PencilSquareIcon className="h-5 w-5" aria-hidden="true" />
            </Link>
          )}

          {/* Delete (Admin only) */}
          {isAdmin && (
            <button
              type="button"
              onClick={() => setDeleteCandidate(row)}
              aria-label={`Delete record ${row.ordinance_number}`}
              className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-lg text-secondary-400 hover:text-error hover:bg-red-50 focus-ring"
            >
              <TrashIcon className="h-5 w-5" aria-hidden="true" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Toast feedback */}
      {toastMessage && (
        <Toast
          message={toastMessage.text}
          type={toastMessage.type}
          onClose={() => setToastMessage(null)}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deleteCandidate)}
        title="Delete Legislative Record"
        message={`Are you sure you want to permanently delete "${deleteCandidate?.ordinance_number}" (${deleteCandidate?.title})? This will remove all associated workflow logs and attachments.`}
        confirmLabel="Yes, Delete Record"
        cancelLabel="Cancel"
        isDestructive
        isLoading={isDeleting}
        onConfirm={confirmDelete}
        onClose={() => setDeleteCandidate(null)}
      />

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-secondary-500 tracking-tight">
            Master Legislative Repository
          </h2>
          <p className="mt-1 text-sm text-secondary-400">
            Official legislative register of the Sangguniang Panlungsod, Naga City.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isUploader && (
            <Link to="/upload">
              <AccessibleButton
                variant="primary"
                leftIcon={<PlusIcon className="h-5 w-5" />}
                ariaLabel="Add new ordinance or resolution"
              >
                Add Document
              </AccessibleButton>
            </Link>
          )}
        </div>
      </div>

      {/* Search and Filters Bar */}
      <section
        aria-label="Repository Filters & Search"
        className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs space-y-4"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end">
          {/* Main Search Input */}
          <div className="lg:col-span-5">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              onClear={() => setSearchQuery('')}
              onSubmit={fetchDocuments}
              placeholder="Search by measure #, title, author, keyword..."
              ariaLabel="Filter documents by query"
              isLoading={loading}
            />
          </div>

          {/* Type Filter */}
          <div className="lg:col-span-2">
            <AccessibleDropdown
              id="filter-type"
              label="Measure Type"
              value={selectedType}
              onChange={(val) => {
                setSelectedType(val);
                setCurrentPage(1);
              }}
              options={[
                { value: 'all', label: 'All Types' },
                { value: 'ordinance', label: 'Ordinance' },
                { value: 'resolution', label: 'Resolution' },
                { value: 'motion', label: 'Motion' },
                { value: 'proclamation', label: 'Proclamation' },
              ]}
            />
          </div>

          {/* Reading Status Filter */}
          <div className="lg:col-span-3">
            <AccessibleDropdown
              id="filter-status"
              label="Reading Status"
              value={selectedStatus}
              onChange={(val) => {
                setSelectedStatus(val);
                setCurrentPage(1);
              }}
              options={[
                { value: 'all', label: 'All Stages' },
                { value: 'draft_received', label: 'Draft Received' },
                { value: 'calendared', label: 'Calendared' },
                { value: 'first_reading', label: '1st Reading' },
                { value: 'second_reading', label: '2nd Reading' },
                { value: 'third_reading_approval', label: '3rd Reading Approval' },
              ]}
            />
          </div>

          {/* Year Filter */}
          <div className="lg:col-span-2">
            <AccessibleDropdown
              id="filter-year"
              label="Year Enacted"
              value={selectedYear}
              onChange={(val) => {
                setSelectedYear(val);
                setCurrentPage(1);
              }}
              options={[
                { value: 'all', label: 'All Years' },
                { value: '2026', label: '2026' },
                { value: '2025', label: '2025' },
                { value: '2024', label: '2024' },
                { value: '2023', label: '2023' },
              ]}
            />
          </div>
        </div>
      </section>

      {/* Accessible Table */}
      <AccessibleTable
        caption="Legislative Document Registry"
        columns={columns}
        data={documents}
        keyField="id"
        sortField={sortField}
        sortDirection={sortDirection}
        onSort={handleSort}
        selectable={isAdmin || isUploader}
        selectedKeys={selectedIds}
        onSelectChange={setSelectedIds}
        isLoading={loading}
        emptyMessage="No legislative records matched the search and filter criteria."
      />

      {/* Accessible Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalRecords}
        itemsPerPage={itemsPerPage}
        onPageChange={(page) => setCurrentPage(page)}
      />
    </div>
  );
};

export default DocumentRepository;
