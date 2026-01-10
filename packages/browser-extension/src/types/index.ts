/**
 * Browser Extension Type Definitions
 */

export interface AppState {
  isLocked: boolean;
  isAuthenticated: boolean;
  userEmail: string | null;
  encryptionKey: CryptoKey | null;
}

export interface StorageKeys {
  // Session storage (cleared on lock)
  SESSION_ENCRYPTION_KEY: string;
  SESSION_ACCESS_TOKEN: string;
  SESSION_REFRESH_TOKEN: string;

  // Local storage (persists)
  LOCAL_USER_EMAIL: string;
  LOCAL_DEVICE_ID: string;
  LOCAL_SETTINGS: string;
}

export interface Settings {
  autoLockMinutes: number;
  apiBaseUrl: string;
  theme: 'light' | 'dark';
}

export interface UnlockFormData {
  email: string;
  masterPassword: string;
}

export interface RegisterFormData {
  email: string;
  masterPassword: string;
  confirmPassword: string;
}

export type AppView =
  | 'loading'
  | 'welcome'
  | 'login'
  | 'register'
  | 'unlock'
  | 'vault'
  | 'settings';
