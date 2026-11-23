import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../hooks/useAuth';
import StatusBadge from '../components/common/StatusBadge';
import AccessibleButton from '../components/common/AccessibleButton';
import LoadingSpinner from '../components/common/LoadingSpinner';
import {
  DocumentTextIcon,
  CalendarDaysIcon,
  UsersIcon,
  ClipboardDocumentCheckIcon,
  PlayIcon,
  MapPinIcon,
  ClockIcon,
  ArrowRightIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

const UPCOMING_HEARINGS = [
  {
    id: 1,
    code: 'SP-2026-14RS',
    title: '14th Regular Council Session',
    dateLabel: 'NOV 24',
    time: '09:00 AM',
    venue: 'SP Session Hall',
    committee: 'Plenary Council',
    status: 'In Session',
  },
  {
    id: 2,
    code: 'HRG-2026-042',
    title: 'Public Hearing: Ord. No. 2026-089 (Digital Archiving)',
    dateLabel: 'NOV 24',
    time: '01:30 PM',
    venue: 'Committee Room A',
    committee: 'Laws, Rules & Ordinances',
    status: 'Today',
  },
  {
    id: 3,
    code: 'HRG-2026-043',
    title: 'Committee Hearing: Traffic & Active Mobility Code',
    dateLabel: 'NOV 26',
    time: '10:00 AM',
    venue: 'Committee Room B',
    committee: 'Infrastructure & Public Works',
    status: 'Scheduled',
  },
  {
    id: 4,
    code: 'HRG-2026-044',
    title: 'FY 2026 Typhoon Resilience Supplemental Budget',
    dateLabel: 'NOV 27',
    time: '09:30 AM',
    venue: 'Naga City People\'s Hall',
    committee: 'Appropriations',
    status: 'Scheduled',
  },
];

/**
 * LegisVault Secretariat Operations Portal
 * Upgraded executive legislative portal layout featuring an Active Session Banner,
 * 4 crisp KPI cards, 3-column analytical charts (with WCAG 1.1.1 accessible table),
 * upcoming Hearing Calendar docket preview, and recent legislative activity.
 */
export const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recentDocuments, setRecentDocuments] = useState([]);
  const [showChartTable, setShowChartTable] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [statsRes, docsRes] = await Promise.allSettled([
          api.get('/dashboard/stats'),
          api.get('/documents', { params: { per_page: 5, sort: 'created_at', direction: 'desc' } }),
        ]);

        if (isMounted) {
          if (statsRes.status === 'fulfilled' && statsRes.value?.data) {
            setStats(statsRes.value.data);
          } else {
            setStats({
              total_documents: 1420,
              pending_readings: 38,
              approved_this_month: 24,
              active_users: 16,
              scheduled_hearings: 6,
              documents_by_type: {
                ordinance: 680,
                resolution: 590,
                motion: 110,
                proclamation: 40,
              },
              documents_by_stage: {
                draft_received: 14,
                calendared: 24,
                first_reading: 15,
                second_reading: 14,
                third_reading_approval: 1353,
              },
            });
          }

          if (docsRes.status === 'fulfilled' && docsRes.value?.data) {
            const raw = docsRes.value.data.data || docsRes.value.data;
            setRecentDocuments(Array.isArray(raw) ? raw.slice(0, 4) : []);
          } else {
            setRecentDocuments([
              {
                id: 1,
                ordinance_number: 'Ord. No. 2026-089',
                title: 'An Ordinance Mandating Digital Archiving and Accessibility Compliance in Naga City',
                document_type: 'ordinance',
                reading_status: 'second_reading',
                author: 'Hon. Ma. Corazon San Jose',
                created_at: '2026-11-18T09:30:00Z',
              },
              {
                id: 2,
                ordinance_number: 'Res. No. 2026-312',
                title: 'Resolution Commending the Sangguniang Panlungsod Secretariat for WCAG 2.2 Compliance',
                document_type: 'resolution',
                reading_status: 'third_reading_approval',
                author: 'Hon. Juan Miguel Perez',
                created_at: '2026-11-17T14:15:00Z',
              },
              {
                id: 3,
                ordinance_number: 'Ord. No. 2026-088',
                title: 'Comprehensive Traffic Management and Pedestrian Safety Code of Naga City',
                document_type: 'ordinance',
                reading_status: 'first_reading',
                author: 'Hon. Salvador Mendoza',
                created_at: '2026-11-15T11:00:00Z',
              },
              {
                id: 4,
                ordinance_number: 'Ord. No. 2026-090',
                title: 'Supplemental FY 2026 Typhoon Resilience & Archival Continuity Appropriation',
                document_type: 'ordinance',
                reading_status: 'calendared',
                author: 'Hon. Juan Miguel Perez',
                created_at: '2026-11-14T16:45:00Z',
              },
            ]);
          }
        }
      } catch (err) {
        console.error('Dashboard load error:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchDashboardData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Chart 1: Measure Status Distribution (Doughnut)
  const stageChartData = {
    labels: ['Draft', 'Calendared', '1st Read', '2nd Read', 'Enacted'],
    datasets: [
      {
        label: 'Measures',
        data: [
          stats?.documents_by_stage?.draft_received || 14,
          stats?.documents_by_stage?.calendared || 24,
          stats?.documents_by_stage?.first_reading || 15,
          stats?.documents_by_stage?.second_reading || 14,
          stats?.documents_by_stage?.third_reading_approval || 1353,
        ],
        backgroundColor: ['#94A3B8', '#0284C7', '#F59E0B', '#EA580C', '#0B3568'],
        borderColor: '#FFFFFF',
        borderWidth: 2,
      },
    ],
  };

  // Chart 2: Ready for Floor Action (Vertical Bar)
  const floorChartData = {
    labels: ['Calendared', '1st Read', '2nd Read', '3rd Read'],
    datasets: [
      {
        label: 'Measures Ready',
        data: [24, 15, 14, 9],
        backgroundColor: '#0B3568',
        borderRadius: 4,
      },
    ],
  };

  // Chart 3: Top Committees Workload (Horizontal Bar)
  const committeeChartData = {
    labels: ['Laws & Rules', 'Appropriations', 'Infrastructure', 'Health'],
    datasets: [
      {
        label: 'Active',
        data: [14, 11, 9, 7],
        backgroundColor: '#0B3568',
        borderRadius: 3,
      },
      {
        label: 'Pending',
        data: [4, 5, 3, 2],
        backgroundColor: '#F59E0B',
        borderRadius: 3,
      },
    ],
  };

  const compactLegendOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#334155',
          font: { family: 'Inter', weight: 600, size: 11 },
          boxWidth: 10,
          padding: 10,
        },
      },
    },
  };

  const horizontalBarOptions = {
    ...compactLegendOptions,
    indexAxis: 'y',
    scales: {
      x: { grid: { color: '#F1F5F9' }, ticks: { color: '#64748B', font: { size: 10 } } },
      y: { grid: { display: false }, ticks: { color: '#334155', font: { size: 10, weight: 600 } } },
    },
  };

  const verticalBarOptions = {
    ...compactLegendOptions,
    plugins: { ...compactLegendOptions.plugins, legend: { display: false } },
    scales: {
      y: { beginAtZero: true, grid: { color: '#F1F5F9' }, ticks: { color: '#64748B', font: { size: 10 } } },
      x: { grid: { display: false }, ticks: { color: '#334155', font: { size: 10, weight: 600 } } },
    },
  };

  if (loading) {
    return (
      <div className="py-16 text-center" role="status">
        <LoadingSpinner size="lg" label="Loading Secretariat Portal metrics..." showText />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Portal Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-secondary-500 tracking-tight">
          Secretariat Operations Portal
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Control legislative sessions, track committee hearings, and oversee Naga City digital records — signed in as{' '}
          <strong className="text-secondary-500">{user?.name || 'Maria Santos'}</strong>.
        </p>
      </div>

      {/* Hero Active Session Banner Card */}
      <section
        aria-label="Active Sangguniang Panlungsod Session"
        className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
      >
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="inline-flex items-center gap-1.5 text-sm font-extrabold text-secondary-500">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-100" aria-hidden="true" />
              Session Active
            </span>
            <span className="rounded-full bg-sky-50 border border-sky-200 px-2.5 py-0.5 text-xs font-bold text-[#0B3568]">
              SP-2026-14RS
            </span>
          </div>

          <p className="text-base font-bold text-secondary-500">
            14th Regular Session — Sangguniang Panlungsod of Naga City
          </p>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1">
              <ClockIcon className="h-4 w-4 text-slate-400" aria-hidden="true" />
              Tuesday, November 24, 2026 at 09:00 AM PHT
            </span>
            <span className="inline-flex items-center gap-1">
              <MapPinIcon className="h-4 w-4 text-slate-400" aria-hidden="true" />
              SP Session Hall, Naga City Hall • 4 hearings &amp; 5 agenda measures
            </span>
          </div>
        </div>

        <div className="shrink-0">
          <Link to="/calendar">
            <AccessibleButton
              variant="primary"
              size="md"
              leftIcon={<PlayIcon className="h-4 w-4" />}
              ariaLabel="Open Legislative Hearing Calendar and Session Schedule"
              className="!bg-[#0B3568] hover:!bg-[#082A54]"
            >
              View Hearing Calendar
            </AccessibleButton>
          </Link>
        </div>
      </section>

      {/* 4 Minimalist Executive KPI Cards */}
      <section aria-label="Key Performance Indicators">
        <h2 className="sr-only">Key Performance Indicators</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-slate-600">Measures Ready for Reading</p>
              <DocumentTextIcon className="h-4 w-4 text-slate-400" aria-hidden="true" />
            </div>
            <p className="mt-3 text-3xl font-extrabold text-secondary-500">
              {stats?.pending_readings || 38}
            </p>
            <p className="mt-1 text-xs text-slate-500">15 for 1st, 14 for 2nd, 9 for 3rd</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-slate-600">Total Enacted Records</p>
              <ClipboardDocumentCheckIcon className="h-4 w-4 text-slate-400" aria-hidden="true" />
            </div>
            <p className="mt-3 text-3xl font-extrabold text-secondary-500">
              {stats?.total_documents?.toLocaleString() || '1,420'}
            </p>
            <p className="mt-1 text-xs text-emerald-700 font-semibold">
              +{stats?.approved_this_month || 24} approved this month
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-slate-600">Scheduled Hearings</p>
              <CalendarDaysIcon className="h-4 w-4 text-slate-400" aria-hidden="true" />
            </div>
            <p className="mt-3 text-3xl font-extrabold text-[#0B3568]">
              {stats?.scheduled_hearings || 6}
            </p>
            <p className="mt-1 text-xs text-slate-500">2 hearings today • 4 this week</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-slate-600">Active Secretariat Staff</p>
              <UsersIcon className="h-4 w-4 text-slate-400" aria-hidden="true" />
            </div>
            <p className="mt-3 text-3xl font-extrabold text-secondary-500">
              {stats?.active_users || 16}
            </p>
            <p className="mt-1 text-xs text-slate-500">Admin, Uploader &amp; Viewer roles</p>
          </div>
        </div>
      </section>

      {/* 3-Column Analytics Row (With WCAG 1.1.1 Accessible Table Toggle) */}
      <section aria-labelledby="analytics-heading" className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 id="analytics-heading" className="text-base font-extrabold text-secondary-500 flex items-center gap-2">
            <ChartBarIcon className="h-5 w-5 text-[#0B3568]" aria-hidden="true" />
            Legislative Analytics &amp; Committee Performance
          </h2>
          <AccessibleButton
            variant="ghost"
            size="sm"
            onClick={() => setShowChartTable((prev) => !prev)}
            ariaLabel={showChartTable ? 'Hide accessible chart data table' : 'View chart data as accessible table'}
          >
            {showChartTable ? 'Hide Accessible Table' : 'View as Accessible Table'}
          </AccessibleButton>
        </div>

        {showChartTable && (
          <div className="overflow-x-auto rounded-xl border border-slate-300 bg-white p-4 shadow-xs" tabIndex={0} role="region" aria-label="Accessible Analytics Data Table">
            <table className="min-w-full divide-y divide-slate-200 text-xs">
              <caption className="sr-only">Numeric summary of measure status distribution and committee workload</caption>
              <thead className="bg-slate-100 font-bold">
                <tr>
                  <th scope="col" className="px-3 py-2 text-left">Reading Stage</th>
                  <th scope="col" className="px-3 py-2 text-right">Measures</th>
                  <th scope="col" className="px-3 py-2 text-left">Committee</th>
                  <th scope="col" className="px-3 py-2 text-right">Active / Pending</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr><th scope="row" className="px-3 py-2 text-left">Draft Received</th><td className="px-3 py-2 text-right">14</td><td className="px-3 py-2">Laws &amp; Rules</td><td className="px-3 py-2 text-right">14 / 4</td></tr>
                <tr><th scope="row" className="px-3 py-2 text-left">Calendared</th><td className="px-3 py-2 text-right">24</td><td className="px-3 py-2">Appropriations</td><td className="px-3 py-2 text-right">11 / 5</td></tr>
                <tr><th scope="row" className="px-3 py-2 text-left">1st Reading</th><td className="px-3 py-2 text-right">15</td><td className="px-3 py-2">Infrastructure</td><td className="px-3 py-2 text-right">9 / 3</td></tr>
                <tr><th scope="row" className="px-3 py-2 text-left">2nd Reading</th><td className="px-3 py-2 text-right">14</td><td className="px-3 py-2">Health &amp; Sanitation</td><td className="px-3 py-2 text-right">7 / 2</td></tr>
              </tbody>
            </table>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Card 1: Measure Status Distribution */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
            <h3 className="text-sm font-extrabold text-secondary-500">Measure Status Distribution</h3>
            <p className="text-xs text-slate-500 mb-3">All legislative records by reading stage</p>
            <div className="h-52">
              <Doughnut data={stageChartData} options={compactLegendOptions} aria-label="Doughnut chart of measure status distribution" />
            </div>
          </div>

          {/* Card 2: Ready for Floor Action */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
            <h3 className="text-sm font-extrabold text-secondary-500">Ready for Floor Action</h3>
            <p className="text-xs text-slate-500 mb-3">Pending measures queued by stage</p>
            <div className="h-52">
              <Bar data={floorChartData} options={verticalBarOptions} aria-label="Bar chart of measures ready for floor action" />
            </div>
          </div>

          {/* Card 3: Top Committees Performance */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
            <h3 className="text-sm font-extrabold text-secondary-500">Top Committees Performance</h3>
            <p className="text-xs text-slate-500 mb-3">Active vs. pending measures by committee</p>
            <div className="h-52">
              <Bar data={committeeChartData} options={horizontalBarOptions} aria-label="Horizontal bar chart of committee workload" />
            </div>
          </div>
        </div>
      </section>

      {/* Bottom Split Row: Upcoming Hearings Docket + Recent Legislative Activity */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Upcoming Hearings & Sessions Preview */}
        <section
          aria-labelledby="upcoming-hearings-heading"
          className="xl:col-span-5 rounded-xl border border-slate-200 bg-white p-5 shadow-xs"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 id="upcoming-hearings-heading" className="text-base font-extrabold text-secondary-500 flex items-center gap-2">
              <CalendarDaysIcon className="h-5 w-5 text-[#0B3568]" aria-hidden="true" />
              Upcoming Hearings &amp; Sessions
            </h2>
            <Link to="/calendar" className="text-xs font-bold text-[#0B3568] hover:underline focus-ring rounded p-1">
              Full Calendar →
            </Link>
          </div>

          <ul role="list" className="divide-y divide-slate-100">
            {UPCOMING_HEARINGS.map((h) => (
              <li key={h.id} className="py-3 first:pt-0 last:pb-0 flex items-start gap-3">
                <div className="w-12 shrink-0 rounded-lg bg-sky-50 border border-sky-200 py-1.5 text-center">
                  <span className="block text-[10px] font-extrabold text-[#0B3568]">{h.dateLabel}</span>
                  <span className="block text-[10px] font-semibold text-slate-600">{h.time.replace(' AM', 'a').replace(' PM', 'p')}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold text-[#0B3568]">{h.code}</span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        h.status === 'In Session'
                          ? 'bg-emerald-100 text-emerald-800'
                          : h.status === 'Today'
                          ? 'bg-amber-100 text-amber-900'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {h.status}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-secondary-500 truncate mt-0.5">{h.title}</p>
                  <p className="text-[11px] text-slate-500 truncate">{h.venue} • {h.committee}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* Recent Legislative Measures */}
        <section
          aria-labelledby="recent-activity-heading"
          className="xl:col-span-7 rounded-xl border border-slate-200 bg-white p-5 shadow-xs"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 id="recent-activity-heading" className="text-base font-extrabold text-secondary-500">
              Recent Legislative Measures
            </h2>
            <Link to="/documents" className="text-xs font-bold text-[#0B3568] hover:underline focus-ring rounded p-1">
              View Full Registry →
            </Link>
          </div>

          <ul role="list" className="divide-y divide-slate-100">
            {recentDocuments.map((doc) => (
              <li
                key={doc.id}
                className="py-3 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Link
                      to={`/documents/${doc.id}`}
                      className="font-extrabold text-[#0B3568] hover:underline text-xs sm:text-sm focus-ring rounded"
                    >
                      {doc.ordinance_number}
                    </Link>
                    <StatusBadge status={doc.reading_status} size="sm" />
                  </div>
                  <p className="text-xs sm:text-sm font-semibold text-secondary-500 line-clamp-1">
                    {doc.title}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Sponsored by <span className="font-semibold text-slate-700">{doc.author}</span>
                  </p>
                </div>

                <Link to={`/documents/${doc.id}`} className="shrink-0">
                  <span className="inline-flex min-h-[36px] items-center gap-1 rounded-lg border border-slate-200 px-3 py-1 text-xs font-bold text-slate-700 hover:bg-slate-50 focus-ring">
                    Inspect
                    <ArrowRightIcon className="h-3.5 w-3.5" aria-hidden="true" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
