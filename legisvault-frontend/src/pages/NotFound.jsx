import React from 'react';
import { Link } from 'react-router-dom';
import AccessibleButton from '../components/common/AccessibleButton';
import { QuestionMarkCircleIcon } from '@heroicons/react/24/outline';

/**
 * WCAG 2.2 Level AA Accessible 404 Not Found Page
 */
export const NotFound = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6">
      <div className="rounded-full bg-slate-100 p-6 text-primary mb-4" aria-hidden="true">
        <QuestionMarkCircleIcon className="h-16 w-16" />
      </div>
      <h1 className="text-4xl font-black text-secondary-500 tracking-tight">
        404 — Page Not Found
      </h1>
      <p className="mt-3 text-base text-secondary-400 max-w-md">
        The legislative resource or portal page you requested could not be located in the LegisVault repository. It may have been reclassified or moved.
      </p>
      <div className="mt-8 flex gap-4">
        <Link to="/dashboard">
          <AccessibleButton variant="primary" size="lg">
            Return to Dashboard
          </AccessibleButton>
        </Link>
        <Link to="/search">
          <AccessibleButton variant="outline" size="lg">
            Search Archive
          </AccessibleButton>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
