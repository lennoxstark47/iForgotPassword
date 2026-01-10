/**
 * Global Application State Store
 * Uses Zustand for lightweight state management
 */

import { create } from 'zustand';
import type { AppView, AppState } from '../types';

interface AppStore extends AppState {
  currentView: AppView;
  isLoading: boolean;
  error: string | null;

  // Actions
  setView: (view: AppView) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setAuthenticated: (isAuthenticated: boolean, email: string | null) => void;
  setEncryptionKey: (key: CryptoKey | null) => void;
  lock: () => void;
  unlock: (email: string, encryptionKey: CryptoKey) => void;
  logout: () => void;
}

export const useAppStore = create<AppStore>((set) => ({
  // Initial state
  isLocked: true,
  isAuthenticated: false,
  userEmail: null,
  encryptionKey: null,
  currentView: 'loading',
  isLoading: false,
  error: null,

  // Actions
  setView: (view) => set({ currentView: view, error: null }),

  setLoading: (loading) => set({ isLoading: loading }),

  setError: (error) => set({ error, isLoading: false }),

  setAuthenticated: (isAuthenticated, email) =>
    set({ isAuthenticated, userEmail: email }),

  setEncryptionKey: (key) => set({ encryptionKey: key }),

  lock: () =>
    set({
      isLocked: true,
      encryptionKey: null,
      currentView: 'unlock',
    }),

  unlock: (email, encryptionKey) =>
    set({
      isLocked: false,
      isAuthenticated: true,
      userEmail: email,
      encryptionKey,
      currentView: 'vault',
      error: null,
    }),

  logout: () =>
    set({
      isLocked: true,
      isAuthenticated: false,
      userEmail: null,
      encryptionKey: null,
      currentView: 'welcome',
      error: null,
    }),
}));
