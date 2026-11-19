import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../context/ThemeContext';
import {
  Bars3Icon,
  ArrowRightOnRectangleIcon,
  SunIcon,
  MoonIcon,
  UserCircleIcon,
  BellIcon,
} from '@heroicons/react/24/outline';

/**
 * @typedef {Object} HeaderProps
 * @property {() => void} onMobileMenuClick - Callback to toggle mobile navigation drawer
 */

/**
 * WCAG 2.2 Level AA Accessible Application Header
 * Top landmark with high-contrast toggle, user credentials display,
 * notifications, and accessible session termination.
 */
export const Header = ({ onMobileMenuClick }) => {
  const { user, logout } = useAuth();
  const { isHighContrast, toggleHighContrast } = useTheme();

  return (
    <header
      role="banner"
      className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6 shadow-xs"
    >
      <div className="flex items-center space-x-3">
        {/* Mobile menu trigger */}
        <button
          type="button"
          onClick={onMobileMenuClick}
          aria-label="Open main navigation menu"
          aria-controls="mobile-navigation"
          className="lg:hidden min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg p-2 text-secondary-500 hover:bg-slate-100 focus-ring"
        >
          <Bars3Icon className="h-6 w-6" aria-hidden="true" />
        </button>

        {/* Page / System Title */}
        <div className="hidden sm:block">
          <h1 className="text-lg font-bold text-secondary-500 leading-tight">
            Integrated Digital Records & Information Management System
          </h1>
          <p className="text-xs text-secondary-400">
            Sangguniang Panlungsod Secretariat Office — Naga City
          </p>
        </div>
      </div>

      {/* Header Actions */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        {/* High Contrast Mode Toggle */}
        <button
          type="button"
          onClick={toggleHighContrast}
          aria-pressed={isHighContrast}
          aria-label={
            isHighContrast
              ? 'Disable High Contrast Mode (currently active)'
              : 'Enable High Contrast Mode (currently inactive)'
          }
          className={`min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg p-2.5 transition-colors focus-ring border ${
            isHighContrast
              ? 'bg-yellow-400 text-black border-yellow-500 font-bold'
              : 'bg-surface text-secondary-500 border-slate-300 hover:bg-slate-100'
          }`}
          title="Toggle High Contrast Mode (WCAG 2.2 AAA Contrast)"
        >
          {isHighContrast ? (
            <SunIcon className="h-5 w-5 text-black" aria-hidden="true" />
          ) : (
            <MoonIcon className="h-5 w-5 text-secondary-500" aria-hidden="true" />
          )}
          <span className="hidden md:inline-block ml-2 text-xs font-bold">
            {isHighContrast ? 'Contrast: ON' : 'High Contrast'}
          </span>
        </button>

        {/* Notifications Icon (Accessible placeholder) */}
        <button
          type="button"
          aria-label="View notifications (0 unread)"
          className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg p-2 text-secondary-400 hover:text-secondary-600 hover:bg-slate-100 focus-ring border border-transparent"
        >
          <BellIcon className="h-5 w-5" aria-hidden="true" />
        </button>

        {/* User Identity Info */}
        {user && (
          <div className="hidden md:flex items-center space-x-2 pl-2 border-l border-slate-200">
            <UserCircleIcon className="h-7 w-7 text-primary" aria-hidden="true" />
            <div className="text-left leading-tight">
              <span className="block text-xs font-bold text-secondary-500 truncate max-w-[140px]">
                {user.name || user.email}
              </span>
              <span className="block text-[11px] font-semibold text-primary capitalize">
                {user.role}
              </span>
            </div>
          </div>
        )}

        {/* Logout Button */}
        <button
          type="button"
          onClick={logout}
          aria-label="Sign out of LegisVault"
          className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-lg px-3 py-2 text-xs sm:text-sm font-semibold text-error hover:bg-red-50 focus-ring border border-red-200 transition-colors"
        >
          <ArrowRightOnRectangleIcon className="h-5 w-5 sm:mr-1.5" aria-hidden="true" />
          <span className="hidden sm:inline">Sign Out</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
