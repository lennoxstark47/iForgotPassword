/**
 * Login Page
 * User login for existing accounts
 */

import { useState } from 'react';
import { Logo } from '../components/Logo';
import { useAppStore } from '../store/appStore';
import { authService } from '../services/auth';

export function Login() {
  const { unlock, setView, setError, setLoading } = useAppStore();
  const [email, setEmail] = useState('');
  const [masterPassword, setMasterPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    try {
      console.log('[LOGIN] Starting login process...');
      
      const result = await authService.unlock({
        email,
        masterPassword,
      });

      console.log('[LOGIN] Login successful, updating state and navigating to vault');
      unlock(result.email, result.encryptionKey);
      
      // Firefox-specific: Force state update by explicitly calling setView
      const { setView } = useAppStore.getState();
      await new Promise(resolve => setTimeout(resolve, 50));
      setView('vault');
      
      console.log('[LOGIN] Forced view to vault');
      setLoading(false);
    } catch (error) {
      console.error('[LOGIN] Error during login:', error);
      const message = error instanceof Error ? error.message : 'Failed to login';
      setErrorMessage(message);
      setError(message);
      setLoading(false);
    }
  };


    return (
    <div className="popup-container flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <Logo size="md" />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-6 py-8">
        <div className="w-full max-w-sm">
          <button
            onClick={() => setView('welcome')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">Sign In</h2>
          <p className="text-gray-600 mb-6">Access your password vault</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                required
                autoComplete="username"
              />
            </div>

            {/* Master Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Master Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={masterPassword}
                  onChange={(e) => setMasterPassword(e.target.value)}
                  className="input pr-10"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {errorMessage}
              </div>
            )}

            {/* Submit Button */}
            <button type="submit" className="btn-primary w-full">
              Sign In
            </button>
          </form>

          {/* Register Link */}
          <div className="mt-4 text-center">
            <button
              onClick={() => setView('register')}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Don't have an account? <span className="text-primary-600 font-medium">Create one</span>
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-gray-200 px-6 py-3 text-center text-xs text-gray-500">
        <div className="flex items-center justify-center gap-2">
          <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
          <span>Zero-knowledge encryption</span>
        </div>
      </div>
    </div>
  );
}
