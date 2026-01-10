/**
 * Background Service Worker
 * Handles extension lifecycle, message passing, and background tasks
 */

import browser from 'webextension-polyfill';

console.log('iForgotPassword background service worker loaded');

// Listen for extension installation or update
browser.runtime.onInstalled.addListener((details) => {
  console.log('Extension installed/updated:', details.reason);

  if (details.reason === 'install') {
    // First time installation
    console.log('First time installation - setting up...');
  } else if (details.reason === 'update') {
    console.log('Extension updated to version:', browser.runtime.getManifest().version);
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

// Listen for messages from popup or content scripts
browser.runtime.onMessage.addListener((message, _sender) => {
  console.log('Background received message:', message);

  if (message.type === 'VAULT_UNLOCKED') {
    // Start auto-lock timer when vault is unlocked
    resetAutoLockTimer();
  } else if (message.type === 'VAULT_LOCKED') {
    // Clear auto-lock timer when vault is manually locked
    if (autoLockTimer) {
      clearTimeout(autoLockTimer);
      autoLockTimer = null;
    }
  } else if (message.type === 'RESET_LOCK_TIMER') {
    // Reset the timer on user activity
    resetAutoLockTimer();
  }

  return true; // Keep the message channel open for async response
});

// Listen for tab updates to inject content scripts if needed
browser.tabs.onUpdated.addListener((_tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    console.log('Tab updated:', tab.url);
  }
});

export {};
