/**
 * Background Service Worker
 * Handles extension lifecycle, message passing, and background tasks
 * Includes automatic sync worker for offline queue processing
 */

import browser from 'webextension-polyfill';
import { syncService } from './services/sync';
import { indexedDB } from './storage/indexedDB';
import { autofillService } from './services/autofill';

console.log('iForgotPassword background service worker loaded');

// Listen for extension installation or update
browser.runtime.onInstalled.addListener((details) => {
  console.log('Extension installed/updated:', details.reason);

  if (details.reason === 'install') {
    // First time installation
    console.log('First time installation - setting up...');
    setupAlarms();
  } else if (details.reason === 'update') {
    console.log('Extension updated to version:', browser.runtime.getManifest().version);
    setupAlarms();
  }
});

// Auto-lock timer - lock vault after inactivity
const AUTO_LOCK_TIMEOUT = 15 * 60 * 1000; // 15 minutes
let autoLockTimer: ReturnType<typeof setTimeout> | null = null;

function resetAutoLockTimer() {
  if (autoLockTimer) {
    clearTimeout(autoLockTimer);
  }

  autoLockTimer = setTimeout(() => {
    console.log('Auto-locking vault due to inactivity');
    // Clear session storage
    browser.storage.session.clear().catch(console.error);
  }, AUTO_LOCK_TIMEOUT);
}

// Background sync configuration
const SYNC_INTERVAL_MINUTES = 5; // Sync every 5 minutes
const SYNC_ALARM_NAME = 'background-sync';

/**
 * Setup periodic sync alarms
 */
function setupAlarms() {
  // Create periodic sync alarm
  browser.alarms.create(SYNC_ALARM_NAME, {
    periodInMinutes: SYNC_INTERVAL_MINUTES,
    delayInMinutes: 1, // First sync after 1 minute
  });
  console.log(`Background sync scheduled every ${SYNC_INTERVAL_MINUTES} minutes`);
}

/**
 * Handle alarm events
 */
browser.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === SYNC_ALARM_NAME) {
    await performBackgroundSync();
  }
});

/**
 * Perform background sync
 */
async function performBackgroundSync() {
  try {
    // Check if user is authenticated (has tokens)
    const sessionData = await browser.storage.session.get(['accessToken']);
    if (!sessionData.accessToken) {
      console.log('Background sync skipped: not authenticated');
      return;
    }

    // Check if online
    if (!navigator.onLine) {
      console.log('Background sync skipped: offline');
      return;
    }

    // Check if there are queued changes
    await indexedDB.init();
    const queuedChanges = await syncService.getQueuedChangesCount();

    if (queuedChanges > 0) {
      console.log(`Background sync: processing ${queuedChanges} queued changes`);
      await syncService.fullSync();
      console.log('Background sync completed successfully');
    } else {
      console.log('Background sync skipped: no queued changes');
    }
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

/**
 * Handle online/offline events
 */
self.addEventListener('online', async () => {
  console.log('Connection restored, triggering sync...');
  // Wait a bit for connection to stabilize
  setTimeout(async () => {
    try {
      const queuedChanges = await syncService.getQueuedChangesCount();
      if (queuedChanges > 0) {
        await syncService.fullSync();
        console.log('Online sync completed');
      }
    } catch (error) {
      console.error('Online sync failed:', error);
    }
  }, 2000);
});

self.addEventListener('offline', () => {
  console.log('Connection lost, sync will queue changes');
});

// Listen for messages from popup or content scripts
browser.runtime.onMessage.addListener((message, sender) => {
  console.log('Background received message:', message);

  if (message.type === 'VAULT_UNLOCKED') {
    // Start auto-lock timer when vault is unlocked
    resetAutoLockTimer();
    // Trigger immediate sync when vault unlocked
    performBackgroundSync().catch(console.error);
  } else if (message.type === 'VAULT_LOCKED') {
    // Clear auto-lock timer when vault is manually locked
    if (autoLockTimer) {
      clearTimeout(autoLockTimer);
      autoLockTimer = null;
    }
  } else if (message.type === 'RESET_LOCK_TIMER') {
    // Reset the timer on user activity
    resetAutoLockTimer();
  } else if (message.type === 'TRIGGER_SYNC') {
    // Manual sync trigger
    performBackgroundSync()
      .then(() => {
        // Send response back
        if (message.respond) {
          browser.runtime.sendMessage({ type: 'SYNC_COMPLETE' });
        }
      })
      .catch((error) => {
        console.error('Manual sync failed:', error);
        if (message.respond) {
          browser.runtime.sendMessage({ type: 'SYNC_ERROR', error: error.message });
        }
      });
  } else if (message.type === 'GET_AUTOFILL_CREDENTIALS') {
    // Handle autofill credential request from content script
    return handleAutofillRequest(message.url, sender.tab?.id);
  }

  return true; // Keep the message channel open for async response
});

// Listen for tab updates to inject content scripts if needed
browser.tabs.onUpdated.addListener((_tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    console.log('Tab updated:', tab.url);
  }
});

/**
 * Handle autofill credential request
 */
async function handleAutofillRequest(url: string, tabId?: number): Promise<any> {
  try {
    // Security check: verify the request is from a valid tab
    if (!tabId) {
      return { success: false, error: 'Invalid request source' };
    }

    // Check if the form is safe to autofill
    const isSafe = await autofillService.isFormSafe(tabId);
    if (!isSafe) {
      return {
        success: false,
        error: 'Autofill blocked: page is not secure (HTTPS required)',
      };
    }

    // Check if vault is unlocked (has encryption key in session)
    const sessionData = await browser.storage.session.get(['encryptionKey']);
    if (!sessionData.encryptionKey) {
      return {
        success: false,
        error: 'Vault is locked. Please unlock to use autofill.',
      };
    }

    // Convert stored key back to CryptoKey
    const encryptionKey = await importEncryptionKey(sessionData.encryptionKey);

    // Get matching credentials
    const credentials = await autofillService.getMatchingCredentials(url, encryptionKey);

    return {
      success: true,
      credentials,
    };
  } catch (error) {
    console.error('Autofill request failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get credentials',
    };
  }
}

/**
 * Import encryption key from stored JWK
 */
async function importEncryptionKey(jwk: any): Promise<CryptoKey> {
  return await crypto.subtle.importKey(
    'jwk',
    jwk,
    {
      name: 'AES-GCM',
      length: 256,
    },
    true,
    ['encrypt', 'decrypt']
  );
}

// Initialize on startup
setupAlarms();

export {};
