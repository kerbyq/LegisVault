import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useAccessibility } from '../hooks/useAccessibility';
import AccessibleButton from '../components/common/AccessibleButton';
import AccessibleModal from '../components/common/AccessibleModal';
import FormField from '../components/common/FormField';
import {
  CheckIcon,
  ClockIcon,
  ChevronRightIcon,
  ArrowRightIcon,
} from '@heroicons/react/20/solid';

/**
 * Stages definition in strict chronological order as specified
 */
export const STAGES = [
  { key: 'draft_received', name: 'Draft Received', stepNumber: 1, description: 'Intake and Secretariat registration' },
  { key: 'calendared', name: 'Calendared', stepNumber: 2, description: 'Scheduled for regular council session' },
  { key: 'first_reading', name: '1st Reading', stepNumber: 3, description: 'Formal reading and committee referral' },
  { key: 'second_reading', name: '2nd Reading', stepNumber: 4, description: 'Debate, interpellation, and amendments' },
  { key: 'third_reading_approval', name: '3rd Reading Approval', stepNumber: 5, description: 'Final nominal voting and enactment' },
];

/**
 * @typedef {Object} WorkflowTrackerProps
 * @property {string} currentStage - Active reading status key
 * @property {(nextStage: string, notes: string, date: string) => Promise<void>} [onAdvance] - Advance callback
 * @property {boolean} [canAdvance=false] - Whether current user has privilege
 * @property {Array<any>} [readingHistory=[]] - Historical log of stages
 * @property {string} [className] - Optional container classes
 */

/**
 * WCAG 2.2 Level AA Legislative Workflow Tracker
 * Multi-signal horizontal stepper with accessible aria-current="step",
 * color-independent icons, and advance stage confirmation modal.
 */
export const WorkflowTracker = ({
  currentStage = 'draft_received',
  onAdvance,
  canAdvance = false,
  readingHistory = [],
  className = '',
}) => {
  const { isUploader } = useAuth();
  const { announce } = useAccessibility();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sessionNotes, setSessionNotes] = useState('');
  const [sessionDate, setSessionDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Determine current stage index
  const currentIndex = STAGES.findIndex((s) => s.key === currentStage);
  const activeIndex = currentIndex === -1 ? 0 : currentIndex;
  const isFinalStage = activeIndex === STAGES.length - 1;
  const nextStageObj = !isFinalStage ? STAGES[activeIndex + 1] : null;

  const handleOpenAdvanceModal = () => {
    setSessionNotes('');
    setIsModalOpen(true);
  };

  const handleConfirmAdvance = async () => {
    if (!nextStageObj || !onAdvance) return;
    setIsSubmitting(true);
    try {
      await onAdvance(nextStageObj.key, sessionNotes, sessionDate);
      announce(`Document successfully advanced to ${nextStageObj.name}.`, 'polite');
      setIsModalOpen(false);
    } catch (err) {
      announce('Failed to advance stage. Please check connection.', 'assertive');
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasPermission = canAdvance || isUploader;

  return (
    <div className={`rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-6 ${className}`}>
      {/* Tracker Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-lg font-bold text-secondary-500">
            Legislative Reading Stage Timeline
          </h3>
          <p className="text-xs text-secondary-400">
            Official chronological progress through the Sangguniang Panlungsod legislative calendar.
          </p>
        </div>

        {/* Stage Advance Action */}
        {hasPermission && !isFinalStage && (
          <AccessibleButton
            variant="primary"
            size="md"
            onClick={handleOpenAdvanceModal}
            rightIcon={<ChevronRightIcon className="h-5 w-5" />}
            ariaLabel={`Advance to next reading stage: ${nextStageObj?.name}`}
          >
            Advance to {nextStageObj?.name}
          </AccessibleButton>
        )}

        {isFinalStage && (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckIcon className="h-4 w-4 mr-1 text-emerald-600" aria-hidden="true" />
            Enacted & Approved
          </span>
        )}
      </div>

      {/* Horizontal Multi-Signal Stepper */}
      <nav aria-label="Legislative Reading Stages Progress" className="py-2">
        <ol className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {STAGES.map((stage, index) => {
            const isCompleted = index < activeIndex;
            const isCurrent = index === activeIndex;
            const isUpcoming = index > activeIndex;

            return (
              <li
                key={stage.key}
                aria-current={isCurrent ? 'step' : undefined}
                className="relative flex flex-col items-center md:items-start group"
              >
                {/* Horizontal Progress Connector Line on Desktop */}
                {index < STAGES.length - 1 && (
                  <div
                    aria-hidden="true"
                    className={`hidden md:block absolute top-4 left-8 right-0 -mr-4 h-1 transition-colors ${
                      index < activeIndex ? 'bg-primary' : 'bg-slate-200'
                    }`}
                  />
                )}

                <div className="flex items-center space-x-3 md:space-x-0 md:flex-col md:items-start w-full">
                  {/* Step Badge */}
                  <div
                    className={`relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-bold text-sm border-2 transition-all shadow-xs ${
                      isCompleted
                        ? 'bg-primary border-primary text-white'
                        : isCurrent
                        ? 'bg-white border-primary text-primary ring-4 ring-primary-100 font-extrabold'
                        : 'bg-slate-100 border-slate-300 text-slate-400'
                    }`}
                  >
                    {isCompleted ? (
                      <CheckIcon className="h-5 w-5 text-white" aria-hidden="true" />
                    ) : (
                      <span>{stage.stepNumber}</span>
                    )}
                    <span className="sr-only">
                      {isCompleted ? 'Completed stage:' : isCurrent ? 'Current active stage:' : 'Upcoming stage:'}
                    </span>
                  </div>

                  {/* Stage Description */}
                  <div className="mt-0 md:mt-3 text-left">
                    <p
                      className={`text-sm font-bold ${
                        isCurrent
                          ? 'text-primary'
                          : isCompleted
                          ? 'text-secondary-500'
                          : 'text-slate-400'
                      }`}
                    >
                      {stage.name}
                    </p>
                    <p className="text-[11px] text-secondary-400 hidden sm:block mt-0.5">
                      {stage.description}
                    </p>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </nav>

      {/* Advance Stage Modal */}
      <AccessibleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Advance Legislative Stage: ${nextStageObj?.name}`}
        description="Advance the official record to the next phase in the legislative reading calendar."
        footer={
          <>
            <AccessibleButton
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </AccessibleButton>
            <AccessibleButton
              variant="primary"
              onClick={handleConfirmAdvance}
              isLoading={isSubmitting}
              loadingText="Advancing stage..."
              rightIcon={<ArrowRightIcon className="h-4 w-4" />}
            >
              Confirm Advance to {nextStageObj?.name}
            </AccessibleButton>
          </>
        }
      >
        <div className="space-y-4">
          <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-900 font-medium">
            This action will log an official event in the audit trail indicating that the legislative measure has moved from <strong>{STAGES[activeIndex]?.name}</strong> to <strong>{nextStageObj?.name}</strong>.
          </div>

          <FormField
            id="advance-date"
            label="Session / Action Date"
            type="date"
            value={sessionDate}
            onChange={(e) => setSessionDate(e.target.value)}
            required
            helperText="Date when the reading or council action occurred."
          />

          <FormField
            id="advance-notes"
            label="Session Remarks / Committee Notes"
            type="textarea"
            rows={3}
            value={sessionNotes}
            onChange={(e) => setSessionNotes(e.target.value)}
            placeholder="e.g. Referred to Committee on Laws during 14th Regular Session; no objections raised."
            helperText="Provide session details, motion proponent, or referral instructions."
          />
        </div>
      </AccessibleModal>
    </div>
  );
};

export default WorkflowTracker;
