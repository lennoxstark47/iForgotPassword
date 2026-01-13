/**
 * PasswordGenerator Component (Redesigned)
 * Modern password generator with tab-based interface
 */

import { useState, useEffect } from 'react';
import {
  passwordGenerator,
  PasswordGeneratorOptions,
  DEFAULT_PASSWORD_OPTIONS,
} from '../services/passwordGenerator';

interface PasswordGeneratorProps {
  onPasswordSelect?: (password: string) => void;
  onClose?: () => void;
}

export function PasswordGeneratorNew({
  onPasswordSelect,
  onClose,
}: PasswordGeneratorProps) {
  const [password, setPassword] = useState('');
  const [options, setOptions] = useState<PasswordGeneratorOptions>(DEFAULT_PASSWORD_OPTIONS);
  const [strength, setStrength] = useState({ score: 0, feedback: '', crackTime: '' });
  const [copied, setCopied] = useState(false);
  const [mode, setMode] = useState<'password' | 'passphrase'>('passphrase');

  // Passphrase options
  const [wordCount, setWordCount] = useState(5);
  const [separator, setSeparator] = useState('-');
  const [capitalize, setCapitalize] = useState(true);
  const [addNumbers, setAddNumbers] = useState(false);

  useEffect(() => {
    generateNewPassword();
  }, [options, mode, wordCount, separator, capitalize, addNumbers]);

  const generateNewPassword = () => {
    try {
      let newPassword: string;

      if (mode === 'password') {
        newPassword = passwordGenerator.generatePassword(options);
      } else {
        // Generate passphrase with custom options
        const words = [];
        const wordList = ['Pupal', 'Herd', 'Ransoming', 'Stationed', 'Flapper', 'Computer', 'Rainbow', 'Thunder', 'Mountain', 'Ocean'];

        for (let i = 0; i < wordCount; i++) {
          let word = wordList[Math.floor(Math.random() * wordList.length)];
          if (capitalize) {
            word = word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
          } else {
            word = word.toLowerCase();
          }
          words.push(word);
        }

        newPassword = words.join(separator);

        if (addNumbers) {
          newPassword += Math.floor(Math.random() * 100);
        }
      }

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

  const restoreDefaults = () => {
    if (mode === 'passphrase') {
      setWordCount(5);
      setSeparator('-');
      setCapitalize(true);
      setAddNumbers(false);
    } else {
      setOptions(DEFAULT_PASSWORD_OPTIONS);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Password Generator</h2>
          <button
            onClick={onClose}
            className="icon-btn"
            title="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Generated Password Display */}
        <div className="p-6 bg-gray-50">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 font-mono text-2xl text-gray-900 break-all select-all">
              {password}
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCopy}
                className="icon-btn"
                title="Copy"
              >
                {copied ? (
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                )}
              </button>
              <button
                onClick={generateNewPassword}
                className="icon-btn"
                title="Regenerate"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
          </div>

          {/* Strength Indicator */}
          <div className="mt-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm font-medium text-green-600">Strong</span>
          </div>

          {/* Fill Button */}
          {onPasswordSelect && (
            <button
              onClick={handleUsePassword}
              className="mt-4 btn-primary w-full"
            >
              Fill Passphrase
            </button>
          )}

          {/* Info Text */}
          <p className="mt-3 text-xs text-gray-500">
            This password will be saved to your RoboForm account and will AutoFill on all your devices. Look up your saved password in RoboForm Logins.
          </p>
        </div>

        {/* Tabs */}
        <div className="tab-list px-6">
          <button
            onClick={() => setMode('password')}
            className={`tab ${mode === 'password' ? 'tab-active' : ''}`}
          >
            Random Password
          </button>
          <button
            onClick={() => setMode('passphrase')}
            className={`tab ${mode === 'passphrase' ? 'tab-active' : ''}`}
          >
            Passphrase
          </button>
        </div>

        {/* Options */}
        <div className="p-6 space-y-6">
          {mode === 'password' ? (
            <>
              {/* Length Slider */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">Length</label>
                  <span className="text-sm font-semibold text-gray-900">{options.length}</span>
                </div>
                <input
                  type="range"
                  min="8"
                  max="32"
                  value={options.length}
                  onChange={(e) => handleOptionChange('length', parseInt(e.target.value))}
                  className="slider w-full"
                />
              </div>

              {/* Checkboxes */}
              <div className="space-y-3">
                <label className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Uppercase letters (A-Z)</span>
                  <input
                    type="checkbox"
                    checked={options.uppercase}
                    onChange={(e) => handleOptionChange('uppercase', e.target.checked)}
                    className="w-4 h-4 text-blue-600"
                  />
                </label>
                <label className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Lowercase letters (a-z)</span>
                  <input
                    type="checkbox"
                    checked={options.lowercase}
                    onChange={(e) => handleOptionChange('lowercase', e.target.checked)}
                    className="w-4 h-4 text-blue-600"
                  />
                </label>
                <label className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Numbers (0-9)</span>
                  <input
                    type="checkbox"
                    checked={options.numbers}
                    onChange={(e) => handleOptionChange('numbers', e.target.checked)}
                    className="w-4 h-4 text-blue-600"
                  />
                </label>
                <label className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Symbols (!@#$%)</span>
                  <input
                    type="checkbox"
                    checked={options.symbols}
                    onChange={(e) => handleOptionChange('symbols', e.target.checked)}
                    className="w-4 h-4 text-blue-600"
                  />
                </label>
              </div>
            </>
          ) : (
            <>
              {/* Word Count Slider */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">Words</label>
                  <span className="text-sm font-semibold text-gray-900">{wordCount}</span>
                </div>
                <input
                  type="range"
                  min="3"
                  max="8"
                  value={wordCount}
                  onChange={(e) => setWordCount(parseInt(e.target.value))}
                  className="slider w-full"
                />
              </div>

              {/* Word Separator */}
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">Word Separator</label>
                <input
                  type="text"
                  value={separator}
                  onChange={(e) => setSeparator(e.target.value)}
                  className="input w-24"
                  maxLength={1}
                />
              </div>

              {/* Toggle Options */}
              <div className="space-y-3">
                <label className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Capitalize first letters</span>
                  <label className="toggle">
                    <input
                      type="checkbox"
                      checked={capitalize}
                      onChange={(e) => setCapitalize(e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </label>
                <label className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Add numbers</span>
                  <label className="toggle">
                    <input
                      type="checkbox"
                      checked={addNumbers}
                      onChange={(e) => setAddNumbers(e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </label>
              </div>
            </>
          )}

          {/* Restore Defaults */}
          <button
            onClick={restoreDefaults}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Restore defaults
          </button>
        </div>
      </div>
    </div>
  );
}
