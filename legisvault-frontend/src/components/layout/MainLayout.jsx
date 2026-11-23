import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import SkipLink from './SkipLink';
import Sidebar from './Sidebar';
import Header from './Header';

/**
 * WCAG 2.2 Level AA Accessible Application Layout
 * Establishes top-level landmarks (banner, navigation, main, contentinfo),
 * skip-to-content routing, and mobile/desktop responsive behavior.
 */
export const MainLayout = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-surface flex flex-col antialiased text-secondary-500">
      {/* 1. Accessible Skip Navigation Link */}
      <SkipLink targetId="main-content" text="Skip to main legislative content" />

      {/* Global Live Region for Screen Readers */}
      <div
        id="a11y-screen-reader-announcer"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      />

      <div className="flex flex-1 w-full overflow-hidden">
        {/* 2. Main Navigation Landmark */}
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          onToggle={() => setIsSidebarCollapsed((prev) => !prev)}
          isMobileOpen={isMobileMenuOpen}
          onMobileClose={() => setIsMobileMenuOpen(false)}
        />

        {/* 3. Main Body Column */}
        <div className="flex flex-1 flex-col overflow-y-auto min-w-0">
          <Header
            onMobileMenuClick={() => setIsMobileMenuOpen(true)}
            onDesktopToggle={() => setIsSidebarCollapsed((prev) => !prev)}
            isSidebarCollapsed={isSidebarCollapsed}
          />

          {/* 4. Main Content Landmark */}
          <main
            id="main-content"
            role="main"
            tabIndex={-1}
            className="flex-1 p-4 sm:p-6 lg:p-8 focus:outline-none"
          >
            <div className="max-w-7xl mx-auto">
              <Outlet />
            </div>
          </main>

          {/* 5. Footer Landmark */}
          <footer
            role="contentinfo"
            className="border-t border-slate-200 bg-white py-4 px-6 text-center text-xs text-secondary-400"
          >
            <p>
              © {new Date().getFullYear()} Sangguniang Panlungsod Secretariat Office, Naga City. All rights reserved.
            </p>
            <p className="mt-1">
              LegisVault — WCAG 2.2 Level AA Compliant Legislative Management System.
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
