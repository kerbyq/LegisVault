import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { ShieldExclamationIcon } from '@heroicons/react/24/outline';
import AccessibleButton from '../common/AccessibleButton';

/**
 * @typedef {Object} RoleGuardProps
 * @property {string|string[]} allowedRoles - Roles permitted to view children
 * @property {React.ReactNode} children - Protected component tree
 */

/**
 * Access control guard that evaluates active user role and displays
 * a WCAG 2.2 compliant 403 Forbidden alert if unauthorized.
 */
export const RoleGuard = ({ allowedRoles, children }) => {
  const { user } = useAuth();
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

  const hasAccess = user && roles.includes(user.role);

  if (!hasAccess) {
    return (
      <div
        role="alert"
        aria-labelledby="forbidden-title"
        aria-describedby="forbidden-desc"
        className="rounded-2xl border-2 border-red-200 bg-red-50/60 p-8 text-center my-6 shadow-sm"
      >
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-error-dark mb-4" aria-hidden="true">
          <ShieldExclamationIcon className="h-8 w-8" />
        </div>
        <h2 id="forbidden-title" className="text-xl font-extrabold text-secondary-500">
          Access Restricted (403 Forbidden)
        </h2>
        <p id="forbidden-desc" className="mt-2 text-sm text-secondary-400 max-w-lg mx-auto">
          Your current account role (<strong className="capitalize font-bold text-secondary-500">{user?.role || 'Guest'}</strong>) is not authorized to access this administrative section. Please contact the Secretariat Administrator if you require elevated privileges.
        </p>
        <div className="mt-6 flex justify-center space-x-3">
          <Link to="/dashboard">
            <AccessibleButton variant="primary">
              Return to Dashboard
            </AccessibleButton>
          </Link>
        </div>
      </div>
    );
  }

  return children;
};

export default RoleGuard;
