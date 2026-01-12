import React, { useState, useEffect } from 'react';
import {
  passwordGenerator,
  PasswordGeneratorOptions,
  DEFAULT_PASSWORD_OPTIONS,
} from '../services/passwordGenerator';

interface PasswordGeneratorProps {
  onPasswordSelect?: (password: string) => void;
  onClose?: () => void;
}

export const PasswordGenerator: React.FC<PasswordGeneratorProps> = ({
  onPasswordSelect,
  onClose,
}) => {
  const [password, setPassword] = useState('');
  const [options, setOptions] = useState<PasswordGeneratorOptions>(DEFAULT_PASSWORD_OPTIONS);
  const [strength, setStrength] = useState({ score: 0, feedback: '', crackTime: '' });
  const [copied, setCopied] = useState(false);
  const [mode, setMode] = useState<'password' | 'passphrase'>('password');

  useEffect(() => {
    generateNewPassword();
  }, [options, mode]);

  const generateNewPassword = () => {
    try {
      const newPassword =
        mode === 'password'
          ? passwordGenerator.generatePassword(options)
          : passwordGenerator.generatePassphrase(options.length / 4, '-');

      setPassword(newPassword);
      const strengthInfo = passwordGenerator.calculateStrength(newPassword);
      setStrength(strengthInfo);
      setCopied(false);
    } catch (error) {
      console.error('Failed to generate password:', error);
    }
  };

  const handleOptionChange = (key: keyof PasswordGeneratorOptions, value: any) => {
    setOptions((prev) => ({ ...prev, [key]: value }));
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy password:', error);
    }
  };

  const handleUsePassword = () => {
    if (onPasswordSelect) {
      onPasswordSelect(password);
    }
    if (onClose) {
      onClose();
    }
  };

  const getStrengthColor = () => {
    if (strength.score >= 80) return 'bg-green-500';
    if (strength.score >= 60) return 'bg-blue-500';
    if (strength.score >= 40) return 'bg-yellow-500';
    if (strength.score >= 20) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-4">
      {/* Mode Toggle */}
      <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setMode('password')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            mode === 'password'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Password
        </button>
        <button
          onClick={() => setMode('passphrase')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            mode === 'passphrase'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Passphrase
        </button>
      </div>

      {/* Generated Password Display */}
      <div className="relative">
        <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-4 pr-24">
          <div className="font-mono text-lg break-all select-all">{password}</div>
        </div>
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-2">
          <button
            onClick={generateNewPassword}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-md transition-colors"
            title="Regenerate"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>
          <button
            onClick={handleCopy}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-md transition-colors"
            title="Copy"
          >
            {copied ? (
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Strength Indicator */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Strength:</span>
          <span className="font-medium">{strength.feedback}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${getStrengthColor()}`}
            style={{ width: `${strength.score}%` }}
          />
        </div>
        <div className="text-xs text-gray-500 text-right">
          Crack time: {strength.crackTime}
        </div>
      </div>

      {mode === 'password' && (
        <>
          {/* Length Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <label className="text-gray-700 font-medium">Length</label>
              <span className="text-gray-600">{options.length}</span>
            </div>
            <input
              type="range"
              min="8"
              max="64"
              value={options.length}
              onChange={(e) => handleOptionChange('length', parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>

          {/* Character Type Checkboxes */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={options.includeUppercase}
                onChange={(e) => handleOptionChange('includeUppercase', e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-gray-700">Uppercase (A-Z)</span>
            </label>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={options.includeLowercase}
                onChange={(e) => handleOptionChange('includeLowercase', e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-gray-700">Lowercase (a-z)</span>
            </label>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={options.includeNumbers}
                onChange={(e) => handleOptionChange('includeNumbers', e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-gray-700">Numbers (0-9)</span>
            </label>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={options.includeSymbols}
                onChange={(e) => handleOptionChange('includeSymbols', e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-gray-700">Symbols (!@#$%...)</span>
            </label>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={options.excludeAmbiguous}
                onChange={(e) => handleOptionChange('excludeAmbiguous', e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-gray-700">Exclude ambiguous (il1Lo0O)</span>
            </label>
          </div>
        </>
      )}

      {mode === 'passphrase' && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <label className="text-gray-700 font-medium">Word Count</label>
            <span className="text-gray-600">{Math.ceil(options.length / 4)}</span>
          </div>
          <input
            type="range"
            min="3"
            max="8"
            value={Math.ceil(options.length / 4)}
            onChange={(e) => handleOptionChange('length', parseInt(e.target.value) * 4)}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <p className="text-xs text-gray-500">
            Passphrases are easier to remember and type, while still being secure.
          </p>
        </div>
      )}

      {/* Action Buttons */}
      {onPasswordSelect && (
        <div className="flex gap-2 pt-2">
          <button
            onClick={handleUsePassword}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Use Password
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      )}
    </div>
  );
};
