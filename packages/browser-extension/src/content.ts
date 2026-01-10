/**
 * Content Script
 * Runs on web pages to detect login forms and enable auto-fill
 */

console.log('iForgotPassword content script loaded');

// Detect password input fields on the page
function detectPasswordFields() {
  const passwordInputs = document.querySelectorAll('input[type="password"]');
  const usernameInputs = document.querySelectorAll(
    'input[type="email"], input[type="text"][name*="user"], input[type="text"][name*="email"], input[autocomplete="username"]'
  );

  if (passwordInputs.length > 0) {
    console.log('Detected password fields:', passwordInputs.length);
    console.log('Detected username fields:', usernameInputs.length);

    // TODO: Week 3-4 - Show auto-fill icon next to fields
    // TODO: Week 3-4 - Listen for user interaction to trigger auto-fill
  }
}

// Run detection when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', detectPasswordFields);
} else {
  detectPasswordFields();
}

// Re-run detection on dynamic content changes
const observer = new MutationObserver(() => {
  detectPasswordFields();
});

observer.observe(document.body, {
  childList: true,
  subtree: true,
});

export {};
