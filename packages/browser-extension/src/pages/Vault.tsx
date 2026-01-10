/**
 * Vault Page
 * Main vault view (placeholder for Week 3-4)
 */

import { Logo } from '../components/Logo';
import { useAppStore } from '../store/appStore';
import { authService } from '../services/auth';

export function Vault() {
  const { userEmail, lock } = useAppStore();

  const handleLock = async () => {
    await authService.lock();
    lock();
  };

  return (
    <div className="popup-container flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <Logo size="sm" />
          <button
            onClick={handleLock}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            title="Lock Vault"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-6 py-8">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">Vault Unlocked</h2>
          <p className="text-gray-600 mb-4">Welcome back, {userEmail}!</p>

          <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg text-sm">
            <strong className="font-semibold">Coming in Week 3-4:</strong>
            <ul className="mt-2 text-left space-y-1">
              <li>• View and manage your passwords</li>
              <li>• Add new credentials</li>
              <li>• Password generator</li>
              <li>• Search functionality</li>
              <li>• Settings page</li>
            </ul>
          </div>

          <div className="mt-6 text-sm text-gray-500">
            <p>Your vault is currently empty. Vault management features will be implemented in the next milestone.</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-gray-200 px-6 py-3">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Vault Unlocked</span>
          </div>
          <span>v0.1.0</span>
        </div>
      </div>
    </div>
  );
}
