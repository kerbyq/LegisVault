import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import LoadingSpinner from '../common/LoadingSpinner';

/**
 * Route protection wrapper requiring authenticated session.
 * Redirects unauthenticated requests to /login while saving destination state.
 */
export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div
        role="status"
        aria-label="Verifying authentication session..."
        className="min-h-screen flex items-center justify-center bg-surface"
      >
        <LoadingSpinner size="lg" label="Verifying session credentials..." showText />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
