import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../context/ThemeContext';
import {
  Bars3Icon,
  MagnifyingGlassIcon,
  PlusIcon,
  CalendarDaysIcon,
  SunIcon,
  MoonIcon,
  BellIcon,
  ViewColumnsIcon,
} from '@heroicons/react/24/outline';

/**
 * @typedef {Object} HeaderProps
 * @property {() => void} onMobileMenuClick - Open mobile drawer
 * @property {() => void} onDesktopToggle - Toggle desktop sidebar collapse
 * @property {boolean} isSidebarCollapsed - Current desktop collapse state
 */

/**
 * WCAG 2.2 Level AA Executive Portal Command Top Bar
 * Features global keyboard search (Ctrl+K), quick legislative shortcuts,
 * Hearing Calendar quick jump, High Contrast toggle, and hearing alerts.
 */
export const Header = ({ onMobileMenuClick, onDesktopToggle, isSidebarCollapsed }) => {
  const { isUploader } = useAuth();
  const { isHighContrast, toggleHighContrast } = useTheme();
  const navigate = useNavigate();
  const searchInputRef = useRef(null);

  const [quickQuery, setQuickQuery] = useState('');
  const [showAlerts, setShowAlerts] = useState(false);

  // Global Ctrl+K / Cmd+K keyboard shortcut to focus search bar
  useEffect(() => {
    const onKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.key === 'Escape') {
        setShowAlerts(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const handleQuickSearch = (e) => {
    e.preventDefault();
    const trimmed = quickQuery.trim();
    navigate(trimmed ? `/search?q=${encodeURIComponent(trimmed)}` : '/search');
  };

  return (
    <header
      role="banner"
      className="sticky top-0 z-20 flex h-16 w-full items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 sm:px-6"
    >
      {/* Left: Sidebar Toggles */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={onMobileMenuClick}
          aria-label="Open main navigation menu"
          aria-controls="mobile-navigation"
          className="lg:hidden min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 focus-ring"
        >
          <Bars3Icon className="h-6 w-6" aria-hidden="true" />
        </button>

        <button
          type="button"
          onClick={onDesktopToggle}
          aria-label={isSidebarCollapsed ? 'Expand sidebar navigation' : 'Collapse sidebar navigation'}
          aria-expanded={!isSidebarCollapsed}
          className="hidden lg:flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-slate-500 hover:text-[#0B3568] hover:bg-slate-100 focus-ring"
          title="Toggle Navigation Sidebar"
        >
          <ViewColumnsIcon className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>

      {/* Center: Command Search Input (Ctrl K) */}
      <form
        onSubmit={handleQuickSearch}
        role="search"
        aria-label="Global LegisVault Search"
        className="flex-1 max-w-md"
      >
        <div className="relative flex items-center">
          <MagnifyingGlassIcon
            className="pointer-events-none absolute left-3 h-4 w-4 text-slate-400"
            aria-hidden="true"
          />
          <input
            ref={searchInputRef}
            type="search"
            value={quickQuery}
            onChange={(e) => setQuickQuery(e.target.value)}
            placeholder="Search LegisVault measures, hearings..."
            aria-label="Search ordinances, resolutions, and hearings"
            className="w-full min-h-[40px] rounded-lg border border-slate-300 bg-slate-50 pl-9 pr-14 py-1.5 text-sm text-secondary-500 placeholder:text-slate-400 hover:bg-white focus:bg-white focus:border-[#0B3568] focus-ring transition-colors"
          />
          <kbd
            aria-hidden="true"
            className="hidden sm:inline-flex items-center rounded border border-slate-300 bg-white px-1.5 py-0.5 text-[10px] font-semibold text-slate-500 absolute right-2.5"
          >
            Ctrl K
          </kbd>
        </div>
      </form>

      {/* Right: Quick Actions + Accessibility Controls */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
        {isUploader && (
          <Link
            to="/upload"
            className="hidden md:inline-flex min-h-[44px] items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold text-[#0B3568] hover:bg-sky-50 border border-transparent hover:border-sky-200 transition-colors focus-ring"
          >
            <PlusIcon className="h-4 w-4 stroke-[2.5]" aria-hidden="true" />
            <span>Upload Measure</span>
          </Link>
        )}

        <Link
          to="/calendar"
          className="hidden sm:inline-flex min-h-[44px] items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 border border-slate-200 transition-colors focus-ring"
        >
          <CalendarDaysIcon className="h-4 w-4 text-[#0B3568]" aria-hidden="true" />
          <span>Hearings</span>
        </Link>

        {/* High Contrast Toggle (WCAG 2.2 AAA Option) */}
        <button
          type="button"
          onClick={toggleHighContrast}
          aria-pressed={isHighContrast}
          aria-label={
            isHighContrast
              ? 'Disable High Contrast Mode (currently active)'
              : 'Enable High Contrast Mode (currently inactive)'
          }
          className={`min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-lg px-2.5 py-2 text-xs font-bold transition-colors focus-ring border ${
            isHighContrast
              ? 'bg-yellow-400 text-black border-yellow-500'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
          }`}
          title="Toggle High Contrast Mode"
        >
          {isHighContrast ? (
            <SunIcon className="h-4 w-4 text-black" aria-hidden="true" />
          ) : (
            <MoonIcon className="h-4 w-4 text-slate-600" aria-hidden="true" />
          )}
          <span className="hidden xl:inline ml-1.5">
            {isHighContrast ? 'Contrast: ON' : 'High Contrast'}
          </span>
        </button>

        {/* Hearing & Session Alerts Bell */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowAlerts((prev) => !prev)}
            aria-expanded={showAlerts}
            aria-label="View legislative hearing notifications (3 upcoming)"
            className="relative min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 hover:text-[#0B3568] focus-ring"
          >
            <BellIcon className="h-5 w-5" aria-hidden="true" />
            <span
              className="absolute top-1.5 right-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-extrabold text-white"
              aria-hidden="true"
            >
              3
            </span>
          </button>

          {showAlerts && (
            <div
              role="region"
              aria-label="Upcoming Hearing Alerts"
              className="absolute right-0 mt-2 w-80 rounded-xl border border-slate-200 bg-white p-4 shadow-xl z-40"
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-extrabold uppercase tracking-wider text-secondary-500">
                  Hearing & Session Alerts
                </span>
                <Link
                  to="/calendar"
                  onClick={() => setShowAlerts(false)}
                  className="text-xs font-bold text-[#0B3568] hover:underline"
                >
                  Open Calendar
                </Link>
              </div>
              <ul className="mt-2 divide-y divide-slate-100 text-xs">
                <li className="py-2">
                  <p className="font-bold text-secondary-500">14th Regular Council Session</p>
                  <p className="text-slate-500">Today, 09:00 AM • SP Session Hall</p>
                </li>
                <li className="py-2">
                  <p className="font-bold text-secondary-500">Public Hearing: Ord. No. 2026-089</p>
                  <p className="text-slate-500">Tomorrow, 01:30 PM • Committee Room A</p>
                </li>
                <li className="py-2">
                  <p className="font-bold text-secondary-500">Traffic Safety Code 2nd Reading</p>
                  <p className="text-slate-500">Nov 27, 10:00 AM • SP Session Hall</p>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
