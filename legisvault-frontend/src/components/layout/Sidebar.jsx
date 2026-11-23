import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  Squares2X2Icon,
  DocumentDuplicateIcon,
  CalendarDaysIcon,
  MagnifyingGlassIcon,
  CloudArrowUpIcon,
  ClockIcon,
  UsersIcon,
  DocumentChartBarIcon,
  ArrowRightOnRectangleIcon,
  ScaleIcon,
} from '@heroicons/react/24/outline';

/**
 * @typedef {Object} SidebarProps
 * @property {boolean} isCollapsed - Collapsed state on desktop
 * @property {() => void} onToggle - Toggle collapse handler
 * @property {boolean} isMobileOpen - Mobile drawer visibility
 * @property {() => void} onMobileClose - Mobile drawer close handler
 */

/**
 * WCAG 2.2 Level AA Accessible Grouped Civic Sidebar
 * Inspired by executive legislative portal navigation patterns while tailored
 * for Naga City Sangguniang Panlungsod RBAC roles (Admin, Uploader, Viewer).
 */
export const Sidebar = ({
  isCollapsed,
  onMobileOpen,
  isMobileOpen,
  onMobileClose,
}) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const userRole = user?.role || 'viewer';

  const navigationGroups = [
    {
      label: 'Dashboard',
      items: [
        {
          name: 'Secretariat Portal',
          href: '/dashboard',
          icon: Squares2X2Icon,
          roles: ['admin', 'uploader', 'viewer'],
        },
      ],
    },
    {
      label: 'Legislative',
      items: [
        {
          name: 'Document Registry',
          href: '/documents',
          icon: DocumentDuplicateIcon,
          roles: ['admin', 'uploader', 'viewer'],
        },
        {
          name: 'Hearing Calendar',
          href: '/calendar',
          icon: CalendarDaysIcon,
          roles: ['admin', 'uploader', 'viewer'],
          badge: '6',
        },
        {
          name: 'Advanced Search',
          href: '/search',
          icon: MagnifyingGlassIcon,
          roles: ['admin', 'uploader', 'viewer'],
        },
        {
          name: 'Upload Measure',
          href: '/upload',
          icon: CloudArrowUpIcon,
          roles: ['admin', 'uploader'],
        },
      ],
    },
    {
      label: 'Governance & Records',
      items: [
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
      ],
    },
  ];

  // Filter groups and items strictly by RBAC role (Hick's Law + Security)
  const visibleGroups = navigationGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => item.roles.includes(userRole)),
    }))
    .filter((group) => group.items.length > 0);

  const initials = (user?.name || 'MS')
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const sidebarContent = (
    <div className="flex h-full flex-col justify-between bg-[#0B3568] text-white shadow-xl">
      <div className="overflow-y-auto">
        {/* Institutional Seal & Brand Header */}
        <div className="flex items-center px-4 py-5 border-b border-[#164A8A]">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-[#0B3568] font-black shadow-md ring-2 ring-sky-300/60"
              aria-hidden="true"
            >
              <ScaleIcon className="h-6 w-6 stroke-[2.2]" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col truncate">
                <span className="text-sm font-extrabold tracking-wider uppercase text-white leading-tight">
                  LegisVault
                </span>
                <span className="text-[11px] text-sky-200 font-medium tracking-wide uppercase">
                  SP Secretariat • Naga
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Grouped Semantic Navigation */}
        <nav aria-label="Main Navigation" className="mt-4 px-3 space-y-5 pb-4">
          {visibleGroups.map((group) => (
            <div key={group.label}>
              {!isCollapsed && (
                <p className="px-3 mb-1.5 text-[11px] font-bold uppercase tracking-wider text-sky-200/75">
                  {group.label}
                </p>
              )}
              <div className="space-y-1">
                {group.items.map((item) => {
                  const isActive =
                    location.pathname === item.href ||
                    (item.href !== '/dashboard' && location.pathname.startsWith(item.href));
                  const Icon = item.icon;

                  return (
                    <NavLink
                      key={item.name}
                      to={item.href}
                      onClick={onMobileClose}
                      aria-current={isActive ? 'page' : undefined}
                      title={isCollapsed ? item.name : undefined}
                      className={`group flex items-center justify-between min-h-[44px] rounded-lg px-3 py-2 text-sm font-semibold transition-all focus-ring ${
                        isActive
                          ? 'bg-[#174D8F] text-white shadow-sm ring-1 ring-sky-300/30'
                          : 'text-sky-100/90 hover:bg-[#12427D] hover:text-white'
                      }`}
                    >
                      <div className="flex items-center min-w-0">
                        <Icon
                          className={`h-5 w-5 shrink-0 transition-colors ${
                            isActive ? 'text-sky-200' : 'text-sky-200/80 group-hover:text-white'
                          }`}
                          aria-hidden="true"
                        />
                        {!isCollapsed && <span className="ml-3 truncate">{item.name}</span>}
                      </div>

                      {!isCollapsed && item.badge && (
                        <span
                          className="ml-2 inline-flex items-center justify-center rounded-full bg-sky-400/25 px-2 py-0.5 text-[11px] font-bold text-sky-100 border border-sky-300/30"
                          aria-label={`${item.badge} scheduled hearings`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* Bottom Pinned Profile & Sign Out Footer */}
      <div className="p-3 border-t border-[#164A8A] bg-[#082A54]">
        {!isCollapsed ? (
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#174D8F] text-xs font-extrabold text-white border border-sky-300/40"
                aria-hidden="true"
              >
                {initials}
              </div>
              <div className="min-w-0 leading-tight">
                <p className="text-xs font-bold text-white truncate">
                  {user?.name || 'Maria Santos'}
                </p>
                <p className="text-[11px] text-sky-200/80 truncate capitalize">
                  {userRole} • SP Naga
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={logout}
              aria-label="Sign out of LegisVault"
              title="Sign Out"
              className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-sky-200 hover:bg-[#174D8F] hover:text-white focus-ring shrink-0"
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={logout}
            aria-label="Sign out of LegisVault"
            title={`Sign out (${user?.name || 'User'})`}
            className="mx-auto min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-sky-200 hover:bg-[#174D8F] hover:text-white focus-ring"
          >
            <ArrowRightOnRectangleIcon className="h-5 w-5" aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden"
          onClick={onMobileClose}
          aria-hidden="true"
        />
      )}

      <aside
        id="mobile-navigation"
        aria-label="Mobile Navigation"
        className={`fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-200 ease-in-out lg:hidden ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </aside>

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
