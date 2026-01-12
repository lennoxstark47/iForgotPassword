/**
 * Unlock Page
 * Master password entry screen
 */

import { useState } from 'react';
import { Logo } from '../components/Logo';
import { useAppStore } from '../store/appStore';
import { authService } from '../services/auth';

export function Unlock() {
  const { unlock, setError, setLoading, logout } = useAppStore();
  const [email, setEmail] = useState('');
  const [masterPassword, setMasterPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Load stored email on mount
  useState(() => {
    authService.getStoredUserEmail().then((storedEmail) => {
      if (storedEmail) {
        setEmail(storedEmail);
      }
    });
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    console.log('[UNLOCK] Starting unlock process...');
    
    try {
      const result = await authService.unlock({
        email,
        masterPassword,
      });

      console.log('[UNLOCK] ============ UNLOCK RESULT RECEIVED ============');
      console.log('[UNLOCK] Result:', result);
      
      if (!result || !result.email || !result.encryptionKey) {
        throw new Error('Invalid unlock result');
      }
      
      console.log('[UNLOCK] Calling unlock() from store');
      
      // Update state
      unlock(result.email, result.encryptionKey);
      
      console.log('[UNLOCK] Store updated successfully');
      setLoading(false);
    } catch (error) {
      console.error('[UNLOCK] ============ ERROR OCCURRED ============');
      console.error('[UNLOCK] Error:', error);
      const message = error instanceof Error ? error.message : 'Failed to unlock vault';
      setErrorMessage(message);
      setError(message);
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await authService.logout();
    logout();
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
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Unlock Vault</h2>
          <p className="text-gray-600 mb-6">Enter your master password to unlock your vault</p>

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
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
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
              Unlock
            </button>
          </form>

          {/* Logout Link */}
          <div className="mt-4 text-center">
            <button
              onClick={handleLogout}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Sign out and use a different account
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
