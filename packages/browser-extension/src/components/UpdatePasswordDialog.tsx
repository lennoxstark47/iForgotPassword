/**
 * UpdatePasswordDialog Component
 * Dialog for updating saved passwords when a change is detected
 */

import type { DecryptedItem } from '../services/vault';

interface UpdatePasswordDialogProps {
  isOpen: boolean;
  item: DecryptedItem | null;
  newPassword: string;
  onUpdate: () => void;
  onDismiss: () => void;
}

export function UpdatePasswordDialog({
  isOpen,
  item,
  newPassword,
  onUpdate,
  onDismiss,
}: UpdatePasswordDialogProps) {
  if (!isOpen || !item) return null;

  const data = item.data as any;
  const getItemIcon = (): string => {
    // Try to get icon based on URL/title
    if (data.title?.toLowerCase().includes('discord')) return '💬';
    if (data.title?.toLowerCase().includes('google')) return '🔍';
    if (data.title?.toLowerCase().includes('facebook')) return '📘';
    if (data.title?.toLowerCase().includes('twitter')) return '🐦';
    return '🔐';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Update password?</h2>
          <button
            onClick={onDismiss}
            className="icon-btn"
            title="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Item Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center text-2xl">
              {getItemIcon()}
            </div>
            <div className="flex-1">
              <div className="font-medium text-gray-900">{data.title || 'Login'}</div>
              <div className="text-sm text-gray-500">{data.email || data.url}</div>
            </div>
            <button className="icon-btn" title="More options">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
              </svg>
            </button>
          </div>

          {/* Fields */}
          <div className="space-y-3 bg-gray-50 rounded-lg p-3">
            {/* Username */}
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <div className="flex-1">
                <div className="text-xs text-gray-500">Username</div>
                <div className="text-sm text-gray-900">{data.username || data.email}</div>
              </div>
            </div>

            {/* Password */}
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
              <div className="flex-1">
                <div className="text-xs text-gray-500">Password</div>
                <div className="text-sm text-gray-900 font-mono">••••••••••</div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-4 border-t border-gray-200">
          <button
            onClick={onDismiss}
            className="flex-1 btn-secondary"
          >
            Not now
          </button>
          <button
            onClick={onUpdate}
            className="flex-1 btn-primary"
          >
            Update
          </button>
        </div>
      </div>
    </div>
  );
}
