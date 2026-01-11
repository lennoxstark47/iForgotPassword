import React, { useState, useEffect } from 'react';
import { localStorageService } from '../storage/localStorage';
import { useAppStore } from '../store/appStore';
import type { Settings as SettingsType } from '../types';

export const Settings: React.FC = () => {
  const { setView, userEmail, logout } = useAppStore();
  const [settings, setSettings] = useState<SettingsType>({
    autoLockMinutes: 15,
    apiBaseUrl: 'http://localhost:3000',
    theme: 'light',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    const loadSettings = async () => {
      const loadedSettings = await localStorageService.getSettings();
      setSettings(loadedSettings);
    };
    loadSettings();
  }, []);

  const handleChange = (key: keyof SettingsType, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage('');

    try {
      localStorageService.saveSettings(settings);
      setSaveMessage('Settings saved successfully!');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      setSaveMessage('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout? This will clear all local data.')) {
      logout();
    }
  };

  const handleClearData = () => {
    if (
      confirm(
        'Are you sure you want to clear all local data? This will delete all cached vault items and you will need to sync again.'
      )
    ) {
      localStorageService.clearAll();
      logout();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
            <button
              onClick={() => setView('vault')}
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-sm text-gray-600">
            Logged in as: <span className="font-medium">{userEmail}</span>
          </p>
        </div>

        {/* Security Settings */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Security</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Auto-lock timeout
              </label>
              <select
                value={settings.autoLockMinutes}
                onChange={(e) => handleChange('autoLockMinutes', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={1}>1 minute</option>
                <option value={5}>5 minutes</option>
                <option value={15}>15 minutes</option>
                <option value={30}>30 minutes</option>
                <option value={60}>1 hour</option>
                <option value={0}>Never</option>
              </select>
              <p className="mt-1 text-xs text-gray-500">
                Automatically lock the vault after this period of inactivity
              </p>
            </div>
          </div>
        </div>

        {/* Advanced Settings */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Advanced</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                API Server URL
              </label>
              <input
                type="url"
                value={settings.apiBaseUrl}
                onChange={(e) => handleChange('apiBaseUrl', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="http://localhost:3000"
              />
              <p className="mt-1 text-xs text-gray-500">
                The URL of your iForgotPassword backend server
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Theme</label>
              <select
                value={settings.theme}
                onChange={(e) => handleChange('theme', e.target.value as 'light' | 'dark')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="light">Light</option>
                <option value="dark">Dark (Coming soon)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Appearance Settings */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">About</h2>
          <div className="space-y-2 text-sm text-gray-600">
            <p>
              <span className="font-medium">Version:</span> 1.0.0 (Week 3-4)
            </p>
            <p>
              <span className="font-medium">Extension ID:</span> {chrome.runtime.id}
            </p>
            <p className="text-xs text-gray-500 pt-2">
              iForgotPassword is a zero-knowledge password manager. Your master password and
              encryption keys never leave your device.
            </p>
          </div>
        </div>

        {/* Save Button */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 font-medium"
          >
            {isSaving ? 'Saving...' : 'Save Settings'}
          </button>
          {saveMessage && (
            <p
              className={`mt-2 text-sm text-center ${
                saveMessage.includes('success') ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {saveMessage}
            </p>
          )}
        </div>

        {/* Danger Zone */}
        <div className="bg-white rounded-lg shadow-sm p-6 border-2 border-red-200">
          <h2 className="text-lg font-semibold text-red-900 mb-4">Danger Zone</h2>
          <div className="space-y-3">
            <button
              onClick={handleLogout}
              className="w-full bg-white text-red-600 border-2 border-red-300 py-2 px-4 rounded-lg hover:bg-red-50 transition-colors font-medium"
            >
              Logout
            </button>
            <button
              onClick={handleClearData}
              className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              Clear All Local Data
            </button>
            <p className="text-xs text-gray-500">
              Warning: Clearing local data will remove all cached vault items. Your data will still
              be stored on the server and can be synced again.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
