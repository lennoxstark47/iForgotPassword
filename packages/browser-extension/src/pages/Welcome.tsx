/**
 * Welcome Page
 * First-time user landing page
 */

import { Logo } from '../components/Logo';
import { useAppStore } from '../store/appStore';

export function Welcome() {
  const { setView } = useAppStore();

  return (
    <div className="popup-container flex flex-col bg-gradient-to-br from-primary-50 to-primary-100">
      <div className="flex-1 flex items-center justify-center px-6 py-8">
        <div className="text-center">
          <Logo size="lg" />

          <h1 className="mt-6 text-3xl font-bold text-gray-900">
            Welcome to iForgotPassword
          </h1>

          <p className="mt-4 text-gray-600 max-w-md mx-auto">
            A secure password manager with zero-knowledge encryption.
            Your data is encrypted on your device and never sent to our servers in plain text.
          </p>

          <div className="mt-8 space-y-3">
            <button
              onClick={() => setView('register')}
              className="btn-primary w-full max-w-xs"
            >
              Create Account
            </button>

            <button
              onClick={() => setView('login')}
              className="btn-secondary w-full max-w-xs"
            >
              Sign In
            </button>
          </div>

          {/* Features */}
          <div className="mt-12 grid grid-cols-1 gap-4 text-left max-w-md mx-auto">
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 text-primary-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <div>
                <h3 className="font-semibold text-gray-900">Zero-Knowledge Security</h3>
                <p className="text-sm text-gray-600">End-to-end encryption ensures only you can access your data</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 text-primary-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <div>
                <h3 className="font-semibold text-gray-900">Sync Across Devices</h3>
                <p className="text-sm text-gray-600">Access your passwords on all your devices</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 text-primary-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <div>
                <h3 className="font-semibold text-gray-900">Auto-Fill</h3>
                <p className="text-sm text-gray-600">Quickly fill login forms with one click</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
