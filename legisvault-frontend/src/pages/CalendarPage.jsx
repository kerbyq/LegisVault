import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../hooks/useAuth';
import { useAccessibility } from '../hooks/useAccessibility';
import AccessibleButton from '../components/common/AccessibleButton';
import AccessibleModal from '../components/common/AccessibleModal';
import FormField from '../components/common/FormField';
import StatusBadge from '../components/common/StatusBadge';
import {
  CalendarDaysIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon,
  MapPinIcon,
  ClockIcon,
  UserGroupIcon,
  CheckCircleIcon,
  PlayCircleIcon,
  DocumentTextIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';

const INITIAL_HEARINGS = [
  {
    id: 1,
    hearing_code: 'SP-2026-14RS',
    title: '14th Regular Session — Sangguniang Panlungsod',
    type: 'regular_session',
    date: '2026-11-24',
    time: '09:00 AM',
    venue: 'SP Session Hall, Naga City Hall',
    committee: 'Plenary Council (All Committees)',
    presiding_officer: 'Hon. Cecilia B. Veluz-De Asis',
    linked_measure: { id: 1, code: 'Ord. No. 2026-089', stage: 'second_reading' },
    status: 'in_session',
    agenda_count: 5,
    notes: 'Order of Business includes 2nd Reading interpellation of the Digital Archiving Ordinance and Committee Reports.',
  },
  {
    id: 2,
    hearing_code: 'HRG-2026-042',
    title: 'Public Hearing: Digital Archiving & Accessibility Mandate',
    type: 'public_hearing',
    date: '2026-11-24',
    time: '01:30 PM',
    venue: 'Committee Room A, Naga City Hall',
    committee: 'Committee on Laws, Rules & Ordinances',
    presiding_officer: 'Hon. Ma. Corazon San Jose',
    linked_measure: { id: 1, code: 'Ord. No. 2026-089', stage: 'second_reading' },
    status: 'scheduled',
    agenda_count: 3,
    notes: 'Stakeholder consultation with Naga City PWD Federation and City IT Office on WCAG 2.2 AA compliance.',
  },
  {
    id: 3,
    hearing_code: 'HRG-2026-043',
    title: 'Committee Hearing: Comprehensive Traffic & Active Mobility Code',
    type: 'committee_hearing',
    date: '2026-11-26',
    time: '10:00 AM',
    venue: 'Committee Room B, SP Wing',
    committee: 'Committee on Infrastructure & Public Works',
    presiding_officer: 'Hon. Salvador Mendoza',
    linked_measure: { id: 3, code: 'Ord. No. 2026-088', stage: 'first_reading' },
    status: 'scheduled',
    agenda_count: 4,
    notes: 'Technical briefing with Naga City Public Safety Office on pedestrian lane expansions.',
  },
  {
    id: 4,
    hearing_code: 'HRG-2026-044',
    title: 'Budget Deliberation: Supplemental FY 2026 Typhoon Resilience Fund',
    type: 'committee_hearing',
    date: '2026-11-27',
    time: '09:30 AM',
    venue: 'Naga City People\'s Hall',
    committee: 'Committee on Appropriations',
    presiding_officer: 'Hon. Juan Miguel Perez',
    linked_measure: { id: 4, code: 'Ord. No. 2026-090', stage: 'calendared' },
    status: 'scheduled',
    agenda_count: 2,
    notes: 'Urgent appropriation review for Bicol River Basin flood mitigation and emergency records backup.',
  },
  {
    id: 5,
    hearing_code: 'HRG-2026-045',
    title: 'Public Consultation: Youth Digital Skills & Technology Hub Grant',
    type: 'public_hearing',
    date: '2026-11-30',
    time: '02:00 PM',
    venue: 'Naga City Youth Center Auditorium',
    committee: 'Committee on Education & Culture',
    presiding_officer: 'Hon. Angela Cristobal',
    linked_measure: { id: 5, code: 'Ord. No. 2026-087', stage: 'first_reading' },
    status: 'scheduled',
    agenda_count: 3,
    notes: 'Open public consultation with university student councils and SK barangay leaders.',
  },
  {
    id: 6,
    hearing_code: 'HRG-2026-039',
    title: 'Committee Review: Bantay Kalusugan Mental Health Support Program',
    type: 'committee_hearing',
    date: '2026-11-18',
    time: '10:00 AM',
    venue: 'Committee Room A, Naga City Hall',
    committee: 'Committee on Health & Sanitation',
    presiding_officer: 'Hon. Dr. Ernesto Valencia',
    linked_measure: { id: 6, code: 'Ord. No. 2026-086', stage: 'draft_received' },
    status: 'completed',
    agenda_count: 2,
    notes: 'Committee report endorsed for plenary calendaring; minutes uploaded to registry.',
  },
];

const TYPE_META = {
  regular_session: {
    label: 'Regular Session',
    dot: 'bg-[#0B3568]',
    pill: 'bg-sky-100 text-[#0B3568] border-sky-300',
  },
  public_hearing: {
    label: 'Public Hearing',
    dot: 'bg-emerald-600',
    pill: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  },
  committee_hearing: {
    label: 'Committee Hearing',
    dot: 'bg-amber-500',
    pill: 'bg-amber-100 text-amber-900 border-amber-300',
  },
};

const STATUS_META = {
  in_session: {
    label: 'In Session',
    classes: 'bg-emerald-50 text-emerald-800 border-emerald-300',
    icon: PlayCircleIcon,
  },
  scheduled: {
    label: 'Scheduled',
    classes: 'bg-sky-50 text-[#0B3568] border-sky-300',
    icon: ClockIcon,
  },
  completed: {
    label: 'Completed',
    classes: 'bg-slate-100 text-slate-700 border-slate-300',
    icon: CheckCircleIcon,
  },
};

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

/**
 * Legislative Hearing & Session Calendar
 * Tracks Naga City SP regular sessions, committee hearings, and public consultations
 * linked directly to legislative measures and reading stages.
 */
export const CalendarPage = () => {
  const { isUploader } = useAuth();
  const { announce } = useAccessibility();

  const [hearings, setHearings] = useState(INITIAL_HEARINGS);
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(10); // November (0-indexed)
  const [selectedDate, setSelectedDate] = useState(null);
  const [typeFilter, setTypeFilter] = useState('all');

  // Schedule Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState('committee_hearing');
  const [newDate, setNewDate] = useState('2026-11-28');
  const [newTime, setNewTime] = useState('10:00 AM');
  const [newVenue, setNewVenue] = useState('Committee Room A, Naga City Hall');
  const [newCommittee, setNewCommittee] = useState('Committee on Laws, Rules & Ordinances');
  const [newMeasureCode, setNewMeasureCode] = useState('Ord. No. 2026-089');
  const [newNotes, setNewNotes] = useState('');

  useEffect(() => {
    const fetchHearings = async () => {
      try {
        const res = await api.get('/hearings');
        const list = res.data?.data || res.data;
        if (Array.isArray(list) && list.length > 0) {
          setHearings(list);
        }
      } catch {
        // Offline demonstration fallback active
      }
    };
    fetchHearings();
  }, []);

  // Calendar grid generation
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const calendarCells = [];
  for (let i = 0; i < firstDayOfMonth; i++) calendarCells.push(null);
  for (let d = 1; d <= daysInMonth; d++) calendarCells.push(d);

  const formatIso = (y, m, d) =>
    `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
    setSelectedDate(null);
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
    setSelectedDate(null);
  };

  const handleResetToday = () => {
    setCurrentYear(2026);
    setCurrentMonth(10);
    setSelectedDate('2026-11-24');
    announce('Jumped to active session date: November 24, 2026.', 'polite');
  };

  const handleStatusToggle = (id) => {
    setHearings((prev) =>
      prev.map((h) => {
        if (h.id !== id) return h;
        const nextStatus =
          h.status === 'scheduled' ? 'in_session' : h.status === 'in_session' ? 'completed' : 'scheduled';
        announce(`Hearing ${h.hearing_code} status updated to ${STATUS_META[nextStatus].label}.`, 'polite');
        return { ...h, status: nextStatus };
      })
    );
  };

  const handleScheduleSubmit = (e) => {
    if (e) e.preventDefault();
    if (!newTitle.trim()) return;

    const created = {
      id: Date.now(),
      hearing_code: `HRG-2026-0${46 + hearings.length}`,
      title: newTitle.trim(),
      type: newType,
      date: newDate,
      time: newTime,
      venue: newVenue,
      committee: newCommittee,
      presiding_officer: 'Assigned Committee Chair',
      linked_measure: { id: 1, code: newMeasureCode || 'Ord. No. 2026-089', stage: 'calendared' },
      status: 'scheduled',
      agenda_count: 1,
      notes: newNotes || 'Scheduled via LegisVault Secretariat Calendar.',
    };

    setHearings((prev) => [created, ...prev]);
    setIsModalOpen(false);
    setNewTitle('');
    setNewNotes('');
    setSelectedDate(newDate);
    announce(`Scheduled new hearing: ${created.title} on ${created.date}.`, 'polite');
  };

  const filteredHearings = hearings.filter((h) => {
    const matchesType = typeFilter === 'all' || h.type === typeFilter;
    const matchesDate = !selectedDate || h.date === selectedDate;
    return matchesType && matchesDate;
  });

  const stats = {
    total: hearings.length,
    active: hearings.filter((h) => h.status === 'in_session').length,
    scheduled: hearings.filter((h) => h.status === 'scheduled').length,
    completed: hearings.filter((h) => h.status === 'completed').length,
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Primary Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-secondary-500 tracking-tight">
            Legislative Hearing & Session Calendar
          </h1>
          <p className="mt-1 text-sm text-secondary-400">
            Track Sangguniang Panlungsod regular sessions, committee hearings, and public consultations linked to active ordinances.
          </p>
        </div>

        {isUploader && (
          <AccessibleButton
            variant="primary"
            size="md"
            leftIcon={<PlusIcon className="h-5 w-5" />}
            onClick={() => setIsModalOpen(true)}
            ariaLabel="Schedule a new legislative hearing or session"
          >
            Schedule Hearing
          </AccessibleButton>
        )}
      </div>

      {/* Hearing Summary Metrics Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <p className="text-xs font-semibold text-slate-500">Total Calendar Events</p>
          <p className="mt-1.5 text-2xl font-extrabold text-secondary-500">{stats.total}</p>
          <p className="mt-0.5 text-xs text-slate-400">November 2026 docket</p>
        </div>
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 shadow-xs">
          <p className="text-xs font-semibold text-emerald-800">Active / In Session</p>
          <p className="mt-1.5 text-2xl font-extrabold text-emerald-700">{stats.active}</p>
          <p className="mt-0.5 text-xs text-emerald-700/80">Live plenary floor action</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <p className="text-xs font-semibold text-slate-500">Upcoming Hearings</p>
          <p className="mt-1.5 text-2xl font-extrabold text-[#0B3568]">{stats.scheduled}</p>
          <p className="mt-0.5 text-xs text-slate-400">Committee & public hearings</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <p className="text-xs font-semibold text-slate-500">Completed Hearings</p>
          <p className="mt-1.5 text-2xl font-extrabold text-slate-700">{stats.completed}</p>
          <p className="mt-0.5 text-xs text-slate-400">Minutes archived in registry</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div
        role="region"
        aria-label="Filter legislative hearings by type"
        className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs"
      >
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center text-xs font-bold text-slate-500 mr-1">
            <FunnelIcon className="h-4 w-4 mr-1" aria-hidden="true" />
            Filter:
          </span>
          {[
            { key: 'all', label: 'All Events' },
            { key: 'regular_session', label: 'Regular Sessions' },
            { key: 'public_hearing', label: 'Public Hearings' },
            { key: 'committee_hearing', label: 'Committee Hearings' },
          ].map((opt) => (
            <button
              key={opt.key}
              type="button"
              onClick={() => setTypeFilter(opt.key)}
              aria-pressed={typeFilter === opt.key}
              className={`min-h-[36px] rounded-full px-3.5 py-1 text-xs font-bold transition-colors focus-ring border ${
                typeFilter === opt.key
                  ? 'bg-[#0B3568] text-white border-[#0B3568]'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {selectedDate && (
          <button
            type="button"
            onClick={() => setSelectedDate(null)}
            className="min-h-[36px] rounded-lg px-3 py-1 text-xs font-bold text-[#0B3568] bg-sky-50 border border-sky-200 hover:bg-sky-100 focus-ring"
          >
            Showing {selectedDate} — Show Entire Month ×
          </button>
        )}
      </div>

      {/* Main Split Grid: Monthly Calendar (Left) + Hearing Schedule Tracker (Right) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Monthly Calendar Grid */}
        <section
          aria-labelledby="calendar-grid-heading"
          className="xl:col-span-7 rounded-xl border border-slate-200 bg-white p-5 shadow-xs"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 id="calendar-grid-heading" className="text-lg font-extrabold text-secondary-500 flex items-center gap-2">
              <CalendarDaysIcon className="h-5 w-5 text-[#0B3568]" aria-hidden="true" />
              {MONTH_NAMES[currentMonth]} {currentYear}
            </h2>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handlePrevMonth}
                aria-label="Previous month"
                className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 focus-ring"
              >
                <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={handleResetToday}
                className="min-h-[40px] rounded-lg border border-slate-200 px-3 text-xs font-bold text-slate-700 hover:bg-slate-100 focus-ring"
              >
                Today (Nov 24)
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                aria-label="Next month"
                className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 focus-ring"
              >
                <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          </div>

          {/* Weekday Headers */}
          <div className="grid grid-cols-7 gap-1.5 text-center mb-1.5" aria-hidden="true">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="py-1.5 text-xs font-bold uppercase tracking-wider text-slate-500">
                {day}
              </div>
            ))}
          </div>

          {/* Day Cells */}
          <div className="grid grid-cols-7 gap-1.5" role="grid" aria-label={`${MONTH_NAMES[currentMonth]} ${currentYear} hearing schedule`}>
            {calendarCells.map((day, idx) => {
              if (!day) {
                return <div key={`empty-${idx}`} className="h-24 rounded-lg bg-slate-50/60" aria-hidden="true" />;
              }

              const iso = formatIso(currentYear, currentMonth, day);
              const dayEvents = hearings.filter(
                (h) => h.date === iso && (typeFilter === 'all' || h.type === typeFilter)
              );
              const isSelected = selectedDate === iso;
              const isToday = iso === '2026-11-24';

              return (
                <button
                  key={iso}
                  type="button"
                  onClick={() => setSelectedDate(isSelected ? null : iso)}
                  aria-pressed={isSelected}
                  aria-label={`${MONTH_NAMES[currentMonth]} ${day}, ${currentYear}, ${dayEvents.length} scheduled hearings`}
                  className={`h-24 p-1.5 rounded-lg border text-left flex flex-col justify-between transition-all focus-ring ${
                    isSelected
                      ? 'border-[#0B3568] bg-sky-50 ring-2 ring-[#0B3568]/20'
                      : isToday
                      ? 'border-emerald-400 bg-emerald-50/40'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span
                      className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                        isToday
                          ? 'bg-[#0B3568] text-white'
                          : isSelected
                          ? 'bg-sky-200 text-[#0B3568]'
                          : 'text-slate-700'
                      }`}
                    >
                      {day}
                    </span>
                    {dayEvents.length > 0 && (
                      <span className="text-[10px] font-extrabold text-[#0B3568] bg-sky-100 px-1.5 rounded-full">
                        {dayEvents.length}
                      </span>
                    )}
                  </div>

                  <div className="space-y-0.5 w-full overflow-hidden">
                    {dayEvents.slice(0, 2).map((ev) => (
                      <div
                        key={ev.id}
                        className="flex items-center gap-1 truncate rounded px-1 py-0.5 text-[10px] font-semibold bg-slate-100 text-slate-700"
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full shrink-0 ${TYPE_META[ev.type]?.dot || 'bg-[#0B3568]'}`}
                          aria-hidden="true"
                        />
                        <span className="truncate">{ev.time}</span>
                      </div>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Calendar Legend */}
          <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-4 text-xs text-slate-600">
            <span className="inline-flex items-center gap-1.5 font-medium">
              <span className="h-2.5 w-2.5 rounded-full bg-[#0B3568]" aria-hidden="true" />
              Regular Session
            </span>
            <span className="inline-flex items-center gap-1.5 font-medium">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-600" aria-hidden="true" />
              Public Hearing
            </span>
            <span className="inline-flex items-center gap-1.5 font-medium">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500" aria-hidden="true" />
              Committee Hearing
            </span>
          </div>
        </section>

        {/* Hearing Schedule & Tracking List */}
        <section
          aria-labelledby="hearing-tracker-heading"
          className="xl:col-span-5 space-y-4"
        >
          <div className="flex items-center justify-between">
            <h2 id="hearing-tracker-heading" className="text-lg font-extrabold text-secondary-500">
              Hearing Tracking Docket ({filteredHearings.length})
            </h2>
          </div>

          {filteredHearings.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
              <CalendarDaysIcon className="mx-auto h-10 w-10 text-slate-300" aria-hidden="true" />
              <p className="mt-2 text-sm font-bold text-slate-700">No hearings scheduled for this date</p>
              <p className="mt-1 text-xs text-slate-500">Select another date or clear the date filter to view the full docket.</p>
            </div>
          ) : (
            <ul role="list" className="space-y-3">
              {filteredHearings.map((hearing) => {
                const tMeta = TYPE_META[hearing.type] || TYPE_META.committee_hearing;
                const sMeta = STATUS_META[hearing.status] || STATUS_META.scheduled;
                const StatusIcon = sMeta.icon;

                return (
                  <li
                    key={hearing.id}
                    className={`rounded-xl border bg-white p-4 shadow-xs transition-all ${
                      hearing.status === 'in_session'
                        ? 'border-l-4 border-l-emerald-600 border-slate-200'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-xs font-extrabold text-[#0B3568]">{hearing.hearing_code}</span>
                        <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-bold ${tMeta.pill}`}>
                          {tMeta.label}
                        </span>
                      </div>

                      <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-bold shrink-0 ${sMeta.classes}`}>
                        <StatusIcon className="h-3.5 w-3.5" aria-hidden="true" />
                        {sMeta.label}
                      </span>
                    </div>

                    <h3 className="mt-2 text-sm font-extrabold text-secondary-500 leading-snug">
                      {hearing.title}
                    </h3>

                    <div className="mt-2.5 space-y-1 text-xs text-slate-600">
                      <p className="flex items-center gap-1.5">
                        <ClockIcon className="h-4 w-4 text-slate-400 shrink-0" aria-hidden="true" />
                        <span className="font-semibold text-secondary-500">{hearing.date}</span>
                        <span>at {hearing.time} PHT</span>
                      </p>
                      <p className="flex items-center gap-1.5">
                        <MapPinIcon className="h-4 w-4 text-slate-400 shrink-0" aria-hidden="true" />
                        <span>{hearing.venue}</span>
                      </p>
                      <p className="flex items-center gap-1.5">
                        <UserGroupIcon className="h-4 w-4 text-slate-400 shrink-0" aria-hidden="true" />
                        <span>{hearing.committee}</span>
                      </p>
                    </div>

                    {/* Linked Measure & Stage */}
                    {hearing.linked_measure && (
                      <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                        <Link
                          to={`/documents/${hearing.linked_measure.id}`}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0B3568] hover:underline focus-ring rounded"
                        >
                          <DocumentTextIcon className="h-4 w-4" aria-hidden="true" />
                          <span>{hearing.linked_measure.code}</span>
                        </Link>
                        <StatusBadge status={hearing.linked_measure.stage} size="sm" />
                      </div>
                    )}

                    {isUploader && (
                      <div className="mt-3 flex justify-end">
                        <button
                          type="button"
                          onClick={() => handleStatusToggle(hearing.id)}
                          className="min-h-[36px] rounded-lg border border-slate-200 px-3 py-1 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 focus-ring"
                        >
                          {hearing.status === 'scheduled'
                            ? 'Mark In Session'
                            : hearing.status === 'in_session'
                            ? 'Mark Completed'
                            : 'Reopen Schedule'}
                        </button>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>

      {/* Schedule New Hearing Modal */}
      <AccessibleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Schedule Legislative Hearing or Session"
        description="Register a new Sangguniang Panlungsod hearing onto the official secretariat calendar."
        footer={
          <>
            <AccessibleButton variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </AccessibleButton>
            <AccessibleButton variant="primary" onClick={handleScheduleSubmit}>
              Save to Calendar
            </AccessibleButton>
          </>
        }
      >
        <form onSubmit={handleScheduleSubmit} className="space-y-4">
          <FormField
            id="hearing-title"
            label="Hearing / Session Title"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="e.g. Public Hearing: Naga River Ecological Code"
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              id="hearing-date"
              label="Hearing Date"
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              required
            />
            <FormField
              id="hearing-time"
              label="Start Time (PHT)"
              value={newTime}
              onChange={(e) => setNewTime(e.target.value)}
              placeholder="e.g. 09:30 AM"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="hearing-type" className="block text-sm font-bold text-secondary-500 mb-1.5">
                Event Category <span className="text-error">*</span>
              </label>
              <select
                id="hearing-type"
                value={newType}
                onChange={(e) => setNewType(e.target.value)}
                className="w-full min-h-[44px] rounded-lg border-slate-300 text-sm focus-ring"
              >
                <option value="regular_session">Regular Session</option>
                <option value="public_hearing">Public Hearing</option>
                <option value="committee_hearing">Committee Hearing</option>
              </select>
            </div>
            <FormField
              id="hearing-measure"
              label="Linked Ordinance / Resolution No."
              value={newMeasureCode}
              onChange={(e) => setNewMeasureCode(e.target.value)}
              placeholder="e.g. Ord. No. 2026-089"
            />
          </div>

          <FormField
            id="hearing-venue"
            label="Session Hall / Committee Venue"
            value={newVenue}
            onChange={(e) => setNewVenue(e.target.value)}
            required
          />

          <FormField
            id="hearing-committee"
            label="Sponsoring Committee"
            value={newCommittee}
            onChange={(e) => setNewCommittee(e.target.value)}
            required
          />

          <FormField
            id="hearing-notes"
            label="Agenda & Public Notice Remarks"
            type="textarea"
            rows={2}
            value={newNotes}
            onChange={(e) => setNewNotes(e.target.value)}
            placeholder="Key agenda items, invited resource speakers, or committee instructions..."
          />
        </form>
      </AccessibleModal>
    </div>
  );
};

export default CalendarPage;
