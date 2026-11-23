import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../context/ThemeContext';
import { useAccessibility } from '../hooks/useAccessibility';
import FormField from '../components/common/FormField';
import AccessibleButton from '../components/common/AccessibleButton';
import SkipLink from '../components/layout/SkipLink';
import {
  LockClosedIcon,
  EnvelopeIcon,
  SunIcon,
  MoonIcon,
  ShieldCheckIcon,
  EyeIcon,
  EyeSlashIcon,
} from '@heroicons/react/24/outline';

/**
 * WCAG 2.2 Level AA Accessible Authentication Portal
 * Strict persistent visible labels, live region error announcements,
 * high-contrast toggle, and 44px minimum target sizes.
 */
export const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { isHighContrast, toggleHighContrast } = useTheme();
  const { announce } = useAccessibility();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Government email address is required.');
      announce('Login failed: Email address is required.', 'assertive');
      return;
    }

    if (!password) {
      setError('Password is required.');
      announce('Login failed: Password is required.', 'assertive');
      return;
    }

    setIsLoading(true);
    try {
      await login(email, password);
      announce('Login successful. Redirecting to legislative dashboard...', 'polite');
      navigate(from, { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid government email or password credentials.';
      setError(msg);
      announce(`Authentication failed: ${msg}`, 'assertive');
    } finally {
      setIsLoading(false);
    }
  };

  // Demo autofill + instant one-click login shortcut
  const handleQuickFill = async (demoRole) => {
    const creds = {
      admin: { email: 'admin@naga.gov.ph', pass: 'password' },
      uploader: { email: 'uploader@naga.gov.ph', pass: 'password' },
      viewer: { email: 'viewer@naga.gov.ph', pass: 'password' },
    };
    const c = creds[demoRole];
    if (c) {
      setEmail(c.email);
      setPassword(c.pass);
      setError('');
      setIsLoading(true);
      try {
        await login(c.email, c.pass);
        announce(`Signed in with ${demoRole} demonstration account. Redirecting...`, 'polite');
        navigate(from, { replace: true });
      } catch {
        announce(`Pre-filled credentials for ${demoRole} account.`, 'polite');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col justify-center py-12 sm:px-6 lg:px-8 antialiased">
      <SkipLink targetId="login-main" text="Skip to login form" />

      {/* Screen Reader Announcer */}
      <div id="a11y-screen-reader-announcer" aria-live="polite" className="sr-only" />

      {/* Top Controls: High Contrast Toggle */}
      <div className="fixed top-4 right-4 z-50">
        <button
          type="button"
          onClick={toggleHighContrast}
          aria-pressed={isHighContrast}
          aria-label={
            isHighContrast
              ? 'Disable High Contrast Mode (currently active)'
              : 'Enable High Contrast Mode (currently inactive)'
          }
          className={`min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg px-3 py-2 text-xs font-bold transition-colors focus-ring border ${
            isHighContrast
              ? 'bg-yellow-400 text-black border-yellow-500'
              : 'bg-white text-secondary-500 border-slate-300 hover:bg-slate-100 shadow-xs'
          }`}
        >
          {isHighContrast ? (
            <SunIcon className="h-4 w-4 mr-1.5 text-black" aria-hidden="true" />
          ) : (
            <MoonIcon className="h-4 w-4 mr-1.5 text-secondary-500" aria-hidden="true" />
          )}
          <span>{isHighContrast ? 'Contrast: ON' : 'High Contrast'}</span>
        </button>
      </div>

      <main id="login-main" role="main" tabIndex={-1} className="sm:mx-auto sm:w-full sm:max-w-md focus:outline-none">
        {/* Branding */}
        <div className="text-center">
          <div
            className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-white font-black text-2xl shadow-lg border-2 border-primary-400"
            aria-hidden="true"
          >
            LV
          </div>
          <h1 className="mt-4 text-3xl font-extrabold text-secondary-500 tracking-tight">
            LegisVault
          </h1>
          <p className="mt-1 text-sm font-semibold text-primary">
            Sangguniang Panlungsod Secretariat Office
          </p>
          <p className="text-xs text-secondary-400">
            City of Naga — Digital Records & Information Management System
          </p>
        </div>

        {/* Login Card */}
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-6 shadow-xl rounded-2xl sm:px-10 border border-slate-200">
            <form onSubmit={handleSubmit} noValidate className="space-y-6">
              <h2 className="text-lg font-bold text-secondary-500 pb-2 border-b border-slate-100">
                Staff Authentication
              </h2>

              {/* Error Message with role="alert" */}
              {error && (
                <div
                  role="alert"
                  className="rounded-lg bg-red-50 border-2 border-red-300 p-4 text-sm font-semibold text-error flex items-start"
                >
                  <span className="mr-2 text-base" aria-hidden="true">⚠</span>
                  <span>{error}</span>
                </div>
              )}

              {/* Email Field */}
              <FormField
                id="login-email"
                label="Government Email Address"
                type="email"
                placeholder="name@naga.gov.ph"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                leftIcon={<EnvelopeIcon className="h-5 w-5" />}
                autoComplete="email"
              />

              {/* Password Field */}
              <FormField
                id="login-password"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter account password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                leftIcon={<LockClosedIcon className="h-5 w-5" />}
                autoComplete="current-password"
                rightElement={
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? 'Hide password' : 'Show password text'}
                    className="min-h-[44px] min-w-[44px] flex items-center justify-center text-secondary-400 hover:text-secondary-600 focus-ring rounded-md"
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5" aria-hidden="true" />
                    ) : (
                      <EyeIcon className="h-5 w-5" aria-hidden="true" />
                    )}
                  </button>
                }
              />

              {/* Helper Links */}
              <div className="flex items-center justify-between text-xs">
                <span className="text-secondary-400">WCAG 2.2 AA Compliant</span>
                <button
                  type="button"
                  onClick={() => alert('Please contact the Secretariat Administrator to reset your government account credentials.')}
                  className="font-bold text-primary hover:text-accent underline focus-ring rounded p-1"
                >
                  Forgot Password?
                </button>
              </div>

              {/* Submit Button */}
              <AccessibleButton
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isLoading}
                loadingText="Verifying credentials..."
                ariaLabel="Sign in to LegisVault"
                className="w-full"
              >
                Sign In to Secretariat Portal
              </AccessibleButton>
            </form>

            {/* Demo Quick-Fill Account Selector */}
            <div className="mt-8 pt-6 border-t border-slate-200">
              <p className="text-xs font-bold text-secondary-400 uppercase tracking-wider mb-3 text-center">
                Quick Demonstration Accounts:
              </p>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickFill('admin')}
                  className="min-h-[44px] py-2 px-2 text-xs font-bold rounded-lg border border-slate-300 hover:bg-slate-50 focus-ring text-secondary-500"
                >
                  Admin
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickFill('uploader')}
                  className="min-h-[44px] py-2 px-2 text-xs font-bold rounded-lg border border-slate-300 hover:bg-slate-50 focus-ring text-secondary-500"
                >
                  Uploader
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickFill('viewer')}
                  className="min-h-[44px] py-2 px-2 text-xs font-bold rounded-lg border border-slate-300 hover:bg-slate-50 focus-ring text-secondary-500"
                >
                  Viewer
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Login;
