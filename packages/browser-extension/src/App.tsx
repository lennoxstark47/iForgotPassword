/**
 * Main App Component
 * Handles view routing and initialization
 */

import { useEffect } from 'react';
import { useAppStore } from './store/appStore';
import { authService } from './services/auth';
import { sessionStorage } from './storage/sessionStorage';

// Pages
import { Loading } from './components/Loading';
import { Welcome } from './pages/Welcome';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Unlock } from './pages/Unlock';
import { Vault } from './pages/Vault';
import { Settings } from './pages/Settings';

export function App() {
  const { currentView, setView, unlock, setLoading } = useAppStore();

  useEffect(() => {
    initializeApp();
  }, []);

  async function initializeApp() {
    setLoading(true);

    try {
      // Initialize services
      await authService.init();

      // Check if session is active (user already unlocked)
      const isSessionActive = await sessionStorage.isSessionActive();

      if (isSessionActive) {
        // Restore session
        const [email, encryptionKey] = await Promise.all([
          authService.getStoredUserEmail(),
          sessionStorage.getEncryptionKey(),
        ]);

        if (email && encryptionKey) {
          unlock(email, encryptionKey);
          return;
        }
      }

      // Check if user has registered before
      const hasRegistered = await authService.hasRegistered();

      if (hasRegistered) {
        // Existing user - show unlock screen
        setView('unlock');
      } else {
        // New user - show welcome screen
        setView('welcome');
      }
    } catch (error) {
      console.error('Failed to initialize app:', error);
      setView('welcome');
    } finally {
      setLoading(false);
    }
  }

  // Render current view
  if (currentView === 'loading') {
    return <Loading />;
  }

  if (currentView === 'welcome') {
    return <Welcome />;
  }

  if (currentView === 'login') {
    return <Login />;
  }

  if (currentView === 'register') {
    return <Register />;
  }

  if (currentView === 'unlock') {
    return <Unlock />;
  }

  if (currentView === 'vault') {
    return <Vault />;
  }

  if (currentView === 'settings') {
    return <Settings />;
  }

  // Fallback
  return <Loading />;
}
