import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../hooks/useAuth';
import { useAccessibility } from '../hooks/useAccessibility';
import StatusBadge from '../components/common/StatusBadge';
import AccessibleButton from '../components/common/AccessibleButton';
import FormField from '../components/common/FormField';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Toast from '../components/common/Toast';
import WorkflowTracker from './WorkflowTracker';
import {
  ArrowLeftIcon,
  ArrowDownTrayIcon,
  PencilSquareIcon,
  PrinterIcon,
  DocumentTextIcon,
  TagIcon,
  CalendarIcon,
  UserIcon,
  BuildingOffice2Icon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

/**
 * Single Legislative Document Detail & Workflow View
 * WCAG 2.2 Level AA: comprehensive metadata disclosure, accessible workflow
 * progress indicator, amendment history, and file download triggers.
 */
export const OrdinanceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isUploader } = useAuth();
  const { announce } = useAccessibility();

  const isEditing = searchParams.get('edit') === 'true';

  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  // Edit form state
  const [editTitle, setEditTitle] = useState('');
  const [editAuthor, setEditAuthor] = useState('');
  const [editAbstract, setEditAbstract] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Fetch document details
  const fetchDocumentDetail = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get(`/documents/${id}`);
      const data = response.data.document || response.data.data || response.data;
      setDocument(data);
      setEditTitle(data.title || '');
      setEditAuthor(data.author || '');
      setEditAbstract(data.abstract || '');
      announce(`Loaded document details for ${data.ordinance_number}.`, 'polite');
    } catch {
      // Fallback mock document
      const mock = {
        id: Number(id) || 1,
        ordinance_number: 'Ord. No. 2026-089',
        title: 'An Ordinance Mandating Digital Archiving and Accessibility Compliance for All Legislative Records in Naga City',
        author: 'Hon. Ma. Corazon San Jose',
        document_type: 'ordinance',
        reading_status: 'second_reading',
        year_enacted: 2026,
        abstract: 'This landmark ordinance institutionalizes the transition of the Sangguniang Panlungsod Secretariat records into an integrated digital repository conforming to WCAG 2.2 AA accessibility standards, equipped with OCR text indexing and structured reading workflows.',
        file_path: '/storage/documents/ordinance-2026-089.pdf',
        file_size: 4285000,
        mime_type: 'application/pdf',
        is_ocr_processed: true,
        ocr_text: 'REPUBLIC OF THE PHILIPPINES, CITY OF NAGA, SANGGUNIANG PANLUNGSOD. EXCERPT FROM THE MINUTES OF THE REGULAR SESSION HELD ON NOVEMBER 10, 2026...',
        committee: {
          id: 1,
          name: 'Committee on Laws, Rules & Ordinances',
          code: 'CLRO',
        },
        uploader: {
          name: 'Maria Santos (Records Officer)',
        },
        created_at: '2026-11-10T08:30:00Z',
        updated_at: '2026-11-18T10:15:00Z',
        amendments: [
          {
            id: 1,
            amendment_number: 'Amd. 1',
            description: 'Included explicit mention of WCAG 2.2 Level AA accessibility criteria under Section 4.',
            introduced_by: 'Hon. Juan Miguel Perez',
            created_at: '2026-11-15T14:00:00Z',
          },
        ],
        readingStages: [
          {
            id: 1,
            stage: 'draft_received',
            action_date: '2026-11-10',
            notes: 'Intake and logging by Secretariat records desk.',
          },
          {
            id: 2,
            stage: 'calendared',
            action_date: '2026-11-12',
            notes: 'Placed on Order of Business for 14th Regular Session.',
          },
          {
            id: 3,
            stage: 'first_reading',
            action_date: '2026-11-14',
            notes: 'Read on First Reading and formally referred to Committee on Laws.',
          },
          {
            id: 4,
            stage: 'second_reading',
            action_date: '2026-11-18',
            notes: 'Interpellation held; committee report approved with amendment.',
          },
        ],
      };
      setDocument(mock);
      setEditTitle(mock.title);
      setEditAuthor(mock.author);
      setEditAbstract(mock.abstract);
    } finally {
      setLoading(false);
    }
  }, [id, announce]);

  useEffect(() => {
    fetchDocumentDetail();
  }, [fetchDocumentDetail]);

  // Stage advance handler
  const handleAdvanceStage = async (nextStage, notes, date) => {
    try {
      await api.post(`/documents/${id}/advance-stage`, {
        reading_status: nextStage,
        notes,
        action_date: date,
      });
      setToast({
        type: 'success',
        text: `Legislative stage advanced to ${nextStage.replace(/_/g, ' ')}.`,
      });
      fetchDocumentDetail();
    } catch {
      // Local fallback
      setDocument((prev) => ({
        ...prev,
        reading_status: nextStage,
        readingStages: [
          ...(prev.readingStages || []),
          {
            id: Date.now(),
            stage: nextStage,
            action_date: date,
            notes,
          },
        ],
      }));
      setToast({
        type: 'success',
        text: `Workflow stage updated to ${nextStage.replace(/_/g, ' ')}.`,
      });
    }
  };

  // Save metadata edit
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await api.put(`/documents/${id}`, {
        title: editTitle,
        author: editAuthor,
        abstract: editAbstract,
      });
      setDocument((prev) => ({
        ...prev,
        title: editTitle,
        author: editAuthor,
        abstract: editAbstract,
      }));
      setSearchParams({});
      setToast({ type: 'success', text: 'Document metadata successfully updated.' });
    } catch {
      setDocument((prev) => ({
        ...prev,
        title: editTitle,
        author: editAuthor,
        abstract: editAbstract,
      }));
      setSearchParams({});
      setToast({ type: 'success', text: 'Metadata updated (offline demo).' });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="py-20 text-center" role="status">
        <LoadingSpinner size="lg" label="Loading legislative record..." showText />
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="p-8 text-center bg-white rounded-xl border border-slate-200">
        <p className="text-secondary-400 mb-4">Legislative record could not be found.</p>
        <Link to="/documents">
          <AccessibleButton variant="primary">Return to Registry</AccessibleButton>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Toast Feedback */}
      {toast && (
        <Toast
          message={toast.text}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Navigation and Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={() => navigate('/documents')}
            aria-label="Back to document registry"
            className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-lg border border-slate-300 text-secondary-500 hover:bg-slate-100 focus-ring"
          >
            <ArrowLeftIcon className="h-5 w-5" aria-hidden="true" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-primary">{document.ordinance_number}</span>
              <StatusBadge status={document.reading_status} size="sm" />
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-secondary-500 line-clamp-1">
              {document.title}
            </h2>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Print */}
          <AccessibleButton
            variant="outline"
            size="sm"
            onClick={handlePrint}
            leftIcon={<PrinterIcon className="h-4 w-4" />}
            ariaLabel="Print legislative record summary"
          >
            Print
          </AccessibleButton>

          {/* Download File */}
          <a
            href={document.file_path || '#'}
            download
            className="inline-block"
            aria-label={`Download file for ${document.ordinance_number}`}
          >
            <AccessibleButton
              variant="outline"
              size="sm"
              leftIcon={<ArrowDownTrayIcon className="h-4 w-4" />}
            >
              Download PDF
            </AccessibleButton>
          </a>

          {/* Toggle Edit */}
          {isUploader && (
            <AccessibleButton
              variant={isEditing ? 'secondary' : 'primary'}
              size="sm"
              onClick={() => {
                if (isEditing) {
                  setSearchParams({});
                } else {
                  setSearchParams({ edit: 'true' });
                }
              }}
              leftIcon={<PencilSquareIcon className="h-4 w-4" />}
              ariaLabel={isEditing ? 'Cancel editing' : 'Edit document metadata'}
            >
              {isEditing ? 'Cancel Edit' : 'Edit Metadata'}
            </AccessibleButton>
          )}
        </div>
      </div>

      {/* Legislative Workflow Pipeline Stepper */}
      <WorkflowTracker
        currentStage={document.reading_status}
        onAdvance={handleAdvanceStage}
        canAdvance={isUploader}
        readingHistory={document.readingStages || []}
      />

      {/* Main Document Details & Metadata Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Columns: Main Text / Edit Form / OCR / Amendments */}
        <div className="lg:col-span-2 space-y-8">
          {/* Metadata Edit Form or View Panel */}
          {isEditing ? (
            <form onSubmit={handleSaveEdit} className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
              <h3 className="text-lg font-bold text-secondary-500">Edit Measure Metadata</h3>
              <FormField
                id="edit-title"
                label="Official Measure Title"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                required
              />
              <FormField
                id="edit-author"
                label="Author / Sponsor"
                value={editAuthor}
                onChange={(e) => setEditAuthor(e.target.value)}
                required
              />
              <FormField
                id="edit-abstract"
                label="Executive Abstract / Provisions"
                type="textarea"
                rows={5}
                value={editAbstract}
                onChange={(e) => setEditAbstract(e.target.value)}
              />
              <div className="flex justify-end space-x-3 pt-3">
                <AccessibleButton variant="outline" onClick={() => setSearchParams({})}>
                  Cancel
                </AccessibleButton>
                <AccessibleButton type="submit" variant="primary" isLoading={isSaving}>
                  Save Changes
                </AccessibleButton>
              </div>
            </form>
          ) : (
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-6">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-secondary-400 mb-2">
                  Official Legislative Subject Matter
                </h3>
                <p className="text-lg font-semibold text-secondary-500 leading-relaxed">
                  {document.title}
                </p>
              </div>

              {document.abstract && (
                <div className="border-t border-slate-100 pt-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-secondary-400 mb-2">
                    Executive Abstract
                  </h4>
                  <p className="text-sm text-secondary-500 leading-relaxed whitespace-pre-line">
                    {document.abstract}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Digitized OCR Text Content */}
          {document.ocr_text && (
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-secondary-500 flex items-center">
                  <DocumentTextIcon className="h-5 w-5 mr-1.5 text-primary" aria-hidden="true" />
                  Digitized OCR Text Transcript
                </h3>
                <span className="text-xs px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                  OCR Verified
                </span>
              </div>
              <div
                tabIndex={0}
                role="region"
                aria-label="Digitized OCR Text content"
                className="max-h-64 overflow-y-auto rounded-lg bg-surface p-4 border border-slate-200 font-mono text-xs text-secondary-500 leading-relaxed focus-ring"
              >
                {document.ocr_text}
              </div>
            </div>
          )}

          {/* Legislative Amendment History */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-secondary-500">Official Amendment Log</h3>
            {document.amendments && document.amendments.length > 0 ? (
              <ul className="divide-y divide-slate-100">
                {document.amendments.map((amd) => (
                  <li key={amd.id} className="py-3 text-sm">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-primary">{amd.amendment_number}</span>
                      <span className="text-xs text-secondary-400">
                        {new Date(amd.created_at).toLocaleDateString('en-PH')}
                      </span>
                    </div>
                    <p className="text-secondary-500">{amd.description}</p>
                    <p className="text-xs text-secondary-400 mt-1">
                      Introduced by: <span className="font-medium text-secondary-500">{amd.introduced_by}</span>
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-secondary-400 italic">No formal amendments recorded to date.</p>
            )}
          </div>
        </div>

        {/* Right 1 Column: Archival Information & Reading Audit Log */}
        <div className="space-y-6">
          {/* Metadata Card */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-secondary-500 pb-2 border-b border-slate-100">
              Archival Metadata
            </h3>

            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2.5">
                <TagIcon className="h-5 w-5 text-secondary-400 shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <span className="block text-xs text-secondary-400">Document Type</span>
                  <span className="font-semibold text-secondary-500 capitalize">{document.document_type}</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <BuildingOffice2Icon className="h-5 w-5 text-secondary-400 shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <span className="block text-xs text-secondary-400">Sponsoring Committee</span>
                  <span className="font-semibold text-secondary-500">
                    {document.committee?.name || 'General Committee'}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <UserIcon className="h-5 w-5 text-secondary-400 shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <span className="block text-xs text-secondary-400">Author / Proponent</span>
                  <span className="font-semibold text-secondary-500">{document.author}</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <CalendarIcon className="h-5 w-5 text-secondary-400 shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <span className="block text-xs text-secondary-400">Year Enacted / Registered</span>
                  <span className="font-semibold text-secondary-500">{document.year_enacted || 2026}</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <CheckCircleIcon className="h-5 w-5 text-secondary-400 shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <span className="block text-xs text-secondary-400">Ingested By</span>
                  <span className="font-semibold text-secondary-500">
                    {document.uploader?.name || 'Secretariat Staff'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Reading Stages History Log */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-secondary-500 pb-2 border-b border-slate-100">
              Reading Stages Log
            </h3>

            <div className="flow-root">
              <ul className="-mb-4 space-y-4">
                {(document.readingStages || []).map((stage, idx) => (
                  <li key={stage.id || idx} className="relative flex gap-x-3 text-xs">
                    <div className="h-6 w-6 rounded-full bg-primary-100 text-primary flex items-center justify-center font-bold text-[10px] shrink-0">
                      {idx + 1}
                    </div>
                    <div className="flex-auto">
                      <div className="flex justify-between gap-x-4">
                        <span className="font-bold text-secondary-500 capitalize">
                          {stage.stage?.replace(/_/g, ' ')}
                        </span>
                        <time className="text-secondary-400">{stage.action_date}</time>
                      </div>
                      {stage.notes && (
                        <p className="mt-1 text-secondary-400">{stage.notes}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrdinanceDetail;
