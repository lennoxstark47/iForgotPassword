/**
 * Register Page
 * New user registration
 */

import { useState } from 'react';
import { Logo } from '../components/Logo';
import { useAppStore } from '../store/appStore';
import { authService } from '../services/auth';

export function Register() {
  const { unlock, setView, setError, setLoading } = useAppStore();
  const [email, setEmail] = useState('');
  const [masterPassword, setMasterPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const validatePassword = (password: string): string | null => {
    if (password.length < 12) {
      return 'Master password must be at least 12 characters';
    }
    if (!/[A-Z]/.test(password)) {
      return 'Master password must contain at least one uppercase letter';
    }
    if (!/[a-z]/.test(password)) {
      return 'Master password must contain at least one lowercase letter';
    }
    if (!/[0-9]/.test(password)) {
      return 'Master password must contain at least one number';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    // Validate passwords match
    if (masterPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match');
      return;
    }

    // Validate password strength
    const passwordError = validatePassword(masterPassword);
    if (passwordError) {
      setErrorMessage(passwordError);
      return;
    }

    setLoading(true);

    try {
      const result = await authService.register({
        email,
        masterPassword,
        confirmPassword,
      });

      console.log('[REGISTER] Registration successful, updating state and navigating to vault');
      unlock(result.email, result.encryptionKey);
      
      // Firefox-specific: Force state update by explicitly calling setView
      const { setView } = useAppStore.getState();
      await new Promise(resolve => setTimeout(resolve, 50));
      setView('vault');
      
      console.log('[REGISTER] Forced view to vault');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to register';
      setErrorMessage(message);
      setError(message);
    } finally {
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
      <div className="flex-1 overflow-y-auto px-6 py-8">
        <div className="w-full max-w-sm mx-auto">
          <button
            onClick={() => setView('welcome')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">Create Account</h2>
          <p className="text-gray-600 mb-6">Set up your secure password vault</p>

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
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                At least 12 characters with uppercase, lowercase, and numbers
              </p>
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirm" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Master Password
              </label>
              <input
                id="confirm"
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input"
                required
                autoComplete="new-password"
              />
            </div>

            {/* Warning */}
            <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-lg text-sm">
              <div className="flex items-start gap-2">
                <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div>
                  <strong className="font-semibold">Important:</strong> Your master password cannot be recovered. Make sure to remember it!
                </div>
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
              Create Account
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-4 text-center">
            <button
              onClick={() => setView('login')}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Already have an account? <span className="text-primary-600 font-medium">Sign in</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
