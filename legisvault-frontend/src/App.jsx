import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import RoleGuard from './components/auth/RoleGuard';
import MainLayout from './components/layout/MainLayout';

// Page Components
import Dashboard from './pages/Dashboard';
import DocumentRepository from './pages/DocumentRepository';
import OrdinanceDetail from './pages/OrdinanceDetail';
import CalendarPage from './pages/CalendarPage';
import SearchPage from './pages/SearchPage';
import UploadDocument from './pages/UploadDocument';
import AuditLogs from './pages/AuditLogs';
import UserManagement from './pages/UserManagement';
import Reports from './pages/Reports';
import Login from './pages/Login';
import NotFound from './pages/NotFound';

/**
 * Root Application Router & Context Tree
 * Integrates AuthProvider, ThemeProvider, Hearing Calendar, and WCAG 2.2 route hierarchies.
 */
export const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Authentication Route */}
            <Route path="/login" element={<Login />} />

            {/* Default Root Redirect */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* Protected Application Routes inside MainLayout */}
            <Route
              element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }
            >
              {/* Secretariat Portal Dashboard */}
              <Route path="/dashboard" element={<Dashboard />} />

              {/* Document Repository & Details */}
              <Route path="/documents" element={<DocumentRepository />} />
              <Route path="/documents/:id" element={<OrdinanceDetail />} />

              {/* Legislative Hearing & Session Calendar */}
              <Route path="/calendar" element={<CalendarPage />} />

              {/* Advanced Search */}
              <Route path="/search" element={<SearchPage />} />

              {/* Legislative Reports */}
              <Route path="/reports" element={<Reports />} />

              {/* Upload Document (Uploader & Admin only) */}
              <Route
                path="/upload"
                element={
                  <RoleGuard allowedRoles={['admin', 'uploader']}>
                    <UploadDocument />
                  </RoleGuard>
                }
              />

              {/* Audit Trail (Admin only) */}
              <Route
                path="/audit-logs"
                element={
                  <RoleGuard allowedRoles={['admin']}>
                    <AuditLogs />
                  </RoleGuard>
                }
              />

              {/* User Management (Admin only) */}
              <Route
                path="/users"
                element={
                  <RoleGuard allowedRoles={['admin']}>
                    <UserManagement />
                  </RoleGuard>
                }
              />
            </Route>

            {/* 404 Catch-All */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
