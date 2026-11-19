import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  HomeIcon,
  DocumentDuplicateIcon,
  MagnifyingGlassIcon,
  CloudArrowUpIcon,
  ClockIcon,
  UsersIcon,
  DocumentChartBarIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
} from '@heroicons/react/24/outline';

/**
 * @typedef {Object} SidebarProps
 * @property {boolean} isCollapsed - Collapsed state
 * @property {() => void} onToggle - Toggle collapse handler
 * @property {boolean} isMobileOpen - Mobile drawer visibility
 * @property {() => void} onMobileClose - Mobile drawer close handler
 */

/**
 * WCAG 2.2 Level AA Accessible Navigation Sidebar
 * Features semantic nav landmark, role-based link filtering,
 * aria-current="page" attributes, and min 44x44px touch targets.
 */
export const Sidebar = ({
  isCollapsed,
  onToggle,
  isMobileOpen,
  onMobileClose,
}) => {
  const { user, isAdmin, isUploader } = useAuth();
  const location = useLocation();

  const navigationItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: HomeIcon,
      roles: ['admin', 'uploader', 'viewer'],
    },
    {
      name: 'Document Registry',
      href: '/documents',
      icon: DocumentDuplicateIcon,
      roles: ['admin', 'uploader', 'viewer'],
    },
    {
      name: 'Advanced Search',
      href: '/search',
      icon: MagnifyingGlassIcon,
      roles: ['admin', 'uploader', 'viewer'],
    },
    {
      name: 'Upload Document',
      href: '/upload',
      icon: CloudArrowUpIcon,
      roles: ['admin', 'uploader'],
    },
    {
      name: 'Legislative Reports',
      href: '/reports',
      icon: DocumentChartBarIcon,
      roles: ['admin', 'uploader', 'viewer'],
    },
    {
      name: 'Audit Trail',
      href: '/audit-logs',
      icon: ClockIcon,
      roles: ['admin'],
    },
    {
      name: 'User Management',
      href: '/users',
      icon: UsersIcon,
      roles: ['admin'],
    },
  ];

  // Filter links according to authenticated user role
  const userRole = user?.role || 'viewer';
  const visibleItems = navigationItems.filter((item) => item.roles.includes(userRole));

  const sidebarContent = (
    <div className="flex h-full flex-col justify-between bg-secondary-500 text-white shadow-xl">
      <div>
        {/* Brand & City Seal Header */}
        <div className="flex items-center justify-between px-4 py-5 border-b border-secondary-600">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-white font-black text-xl border border-primary-400 shadow-inner"
              aria-hidden="true"
            >
              LV
            </div>
            {!isCollapsed && (
              <div className="flex flex-col truncate">
                <span className="text-base font-extrabold tracking-wide text-white">LegisVault</span>
                <span className="text-xs text-slate-300 font-medium">SP Naga City</span>
              </div>
            )}
          </div>

          {/* Desktop Collapse Toggle */}
          <button
            type="button"
            onClick={onToggle}
            aria-label={isCollapsed ? 'Expand main navigation sidebar' : 'Collapse main navigation sidebar'}
            aria-expanded={!isCollapsed}
            className="hidden lg:flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-slate-300 hover:text-white hover:bg-secondary-600 focus-ring"
          >
            {isCollapsed ? (
              <ChevronDoubleRightIcon className="h-5 w-5" aria-hidden="true" />
            ) : (
              <ChevronDoubleLeftIcon className="h-5 w-5" aria-hidden="true" />
            )}
          </button>
        </div>

        {/* Main Navigation Links */}
        <nav aria-label="Main Navigation" className="mt-4 px-3 space-y-1.5">
          {visibleItems.map((item) => {
            const isActive = location.pathname === item.href;
            const Icon = item.icon;

            return (
              <NavLink
                key={item.name}
                to={item.href}
                onClick={onMobileClose}
                aria-current={isActive ? 'page' : undefined}
                className={({ isActive: linkActive }) =>
                  `group flex items-center min-h-[44px] rounded-lg px-3 py-2.5 text-sm font-semibold transition-all focus-ring ${
                    linkActive
                      ? 'bg-primary text-white border-l-4 border-accent shadow-md'
                      : 'text-slate-200 hover:bg-secondary-600 hover:text-white'
                  }`
                }
              >
                <Icon
                  className={`h-6 w-6 shrink-0 transition-colors ${
                    isActive ? 'text-accent-light' : 'text-slate-300 group-hover:text-white'
                  }`}
                  aria-hidden="true"
                />
                {!isCollapsed && <span className="ml-3 truncate">{item.name}</span>}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Role / Office Indicator Footer */}
      <div className="p-4 border-t border-secondary-600 bg-secondary-700/50">
        {!isCollapsed ? (
          <div className="text-xs text-slate-300">
            <p className="font-bold text-white uppercase tracking-wider">Secretariat Office</p>
            <p className="mt-0.5 truncate">Sangguniang Panlungsod</p>
            <div className="mt-2 inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold uppercase bg-primary-700 text-sky-100 border border-primary-500">
              Role: {userRole}
            </div>
          </div>
        ) : (
          <div className="flex justify-center" title={`Role: ${userRole}`}>
            <span className="h-3 w-3 rounded-full bg-accent" aria-hidden="true" />
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Backdrop & Drawer */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden"
          onClick={onMobileClose}
          aria-hidden="true"
        />
      )}

      {/* Mobile Drawer */}
      <aside
        id="mobile-navigation"
        aria-label="Mobile Navigation"
        className={`fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-200 ease-in-out lg:hidden ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Desktop Persistent Sidebar */}
      <aside
        aria-label="Sidebar Navigation"
        className={`hidden lg:block shrink-0 transition-all duration-200 ease-in-out ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        <div className="fixed inset-y-0 left-0 z-30 transition-all duration-200 ease-in-out">
          <div className={`h-full ${isCollapsed ? 'w-20' : 'w-64'}`}>
            {sidebarContent}
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
