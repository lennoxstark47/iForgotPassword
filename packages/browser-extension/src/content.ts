/**
 * Content Script
 * Runs on web pages to detect login forms and enable auto-fill
 */

import browser from 'webextension-polyfill';

interface LoginForm {
  form: HTMLFormElement | null;
  usernameField: HTMLInputElement | null;
  passwordField: HTMLInputElement;
  formId: string;
}

class ContentScript {
  private detectedForms: Map<string, LoginForm> = new Map();
  private autofillIconClass = 'ifp-autofill-icon';
  private overlayClass = 'ifp-autofill-overlay';

  constructor() {
    this.init();
  }

  private init() {
    console.log('iForgotPassword content script loaded');

    // Inject styles
    this.injectStyles();

    // Run initial detection
    this.detectLoginForms();

    // Re-run detection on dynamic content changes
    const observer = new MutationObserver(() => {
      this.detectLoginForms();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // Listen for messages from background script
    browser.runtime.onMessage.addListener(this.handleMessage.bind(this));
  }

  /**
   * Inject CSS styles for autofill UI
   */
  private injectStyles() {
    if (document.getElementById('ifp-autofill-styles')) return;

    const style = document.createElement('style');
    style.id = 'ifp-autofill-styles';
    style.textContent = `
      .${this.autofillIconClass} {
        position: absolute;
        width: 20px;
        height: 20px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 4px;
        cursor: pointer;
        z-index: 999999;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        transition: all 0.2s ease;
      }

      .${this.autofillIconClass}:hover {
        transform: scale(1.1);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
      }

      .${this.autofillIconClass}::after {
        content: '🔑';
        font-size: 12px;
        line-height: 1;
      }

      .${this.overlayClass} {
        position: absolute;
        background: white;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
        z-index: 999999;
        min-width: 250px;
        max-width: 350px;
        max-height: 300px;
        overflow-y: auto;
      }

      .${this.overlayClass}-header {
        padding: 12px 16px;
        border-bottom: 1px solid #e5e7eb;
        font-weight: 600;
        font-size: 14px;
        color: #1f2937;
        background: #f9fafb;
        border-radius: 8px 8px 0 0;
      }

      .${this.overlayClass}-item {
        padding: 12px 16px;
        cursor: pointer;
        border-bottom: 1px solid #f3f4f6;
        transition: background 0.15s ease;
      }

      .${this.overlayClass}-item:hover {
        background: #f9fafb;
      }

      .${this.overlayClass}-item:last-child {
        border-bottom: none;
      }

      .${this.overlayClass}-item-title {
        font-weight: 500;
        font-size: 14px;
        color: #1f2937;
        margin-bottom: 4px;
      }

      .${this.overlayClass}-item-username {
        font-size: 12px;
        color: #6b7280;
      }

      .${this.overlayClass}-empty {
        padding: 24px 16px;
        text-align: center;
        color: #9ca3af;
        font-size: 13px;
      }
    `;

    document.head.appendChild(style);
  }

  /**
   * Detect login forms on the page
   */
  private detectLoginForms() {
    // Find all password fields
    const passwordFields = Array.from(
      document.querySelectorAll<HTMLInputElement>('input[type="password"]')
    );

    passwordFields.forEach((passwordField) => {
      // Skip if already processed
      const formId = this.getFormId(passwordField);
      if (this.detectedForms.has(formId)) return;

      // Find the form
      const form = passwordField.closest('form');

      // Find username field (look for email or text input before password field)
      const usernameField = this.findUsernameField(passwordField, form);

      // Create login form object
      const loginForm: LoginForm = {
        form,
        usernameField,
        passwordField,
        formId,
      };

      this.detectedForms.set(formId, loginForm);

      // Add autofill icon to password field (and username if exists)
      if (usernameField) {
        this.addAutofillIcon(usernameField, formId);
      }
      this.addAutofillIcon(passwordField, formId);

      console.log('Detected login form:', formId);
    });
  }

  /**
   * Find username field near password field
   */
  private findUsernameField(
    passwordField: HTMLInputElement,
    form: HTMLFormElement | null
  ): HTMLInputElement | null {
    // Search within form if available
    const searchRoot = form || document;

    // Look for email or username inputs
    const candidates = Array.from(
      searchRoot.querySelectorAll<HTMLInputElement>(
        'input[type="email"], input[type="text"], input[autocomplete="username"], input[name*="user"], input[name*="email"], input[id*="user"], input[id*="email"]'
      )
    );

    // Find the closest one before the password field
    let closest: HTMLInputElement | null = null;
    let minDistance = Infinity;

    for (const candidate of candidates) {
      // Skip if it's after the password field in DOM order
      const comparison = passwordField.compareDocumentPosition(candidate);
      if (comparison & Node.DOCUMENT_POSITION_FOLLOWING) continue;

      // Calculate distance
      const passwordRect = passwordField.getBoundingClientRect();
      const candidateRect = candidate.getBoundingClientRect();
      const distance = Math.abs(passwordRect.top - candidateRect.top);

      if (distance < minDistance) {
        minDistance = distance;
        closest = candidate;
      }
    }

    return closest;
  }

  /**
   * Generate unique ID for a form
   */
  private getFormId(field: HTMLInputElement): string {
    const form = field.closest('form');
    if (form && form.id) return `form-${form.id}`;
    if (form && form.name) return `form-${form.name}`;

    // Generate ID based on field position
    const allPasswordFields = Array.from(document.querySelectorAll('input[type="password"]'));
    const index = allPasswordFields.indexOf(field);
    return `password-${index}`;
  }

  /**
   * Add autofill icon next to input field
   */
  private addAutofillIcon(field: HTMLInputElement, formId: string) {
    // Skip if icon already exists
    const existingIcon = field.parentElement?.querySelector(`.${this.autofillIconClass}`);
    if (existingIcon) return;

    // Create icon
    const icon = document.createElement('div');
    icon.className = this.autofillIconClass;
    icon.dataset.formId = formId;
    icon.dataset.fieldType = field.type;

    // Position icon
    this.positionIcon(icon, field);

    // Add click handler
    icon.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.showAutofillOverlay(icon, formId);
    });

    // Insert icon
    document.body.appendChild(icon);

    // Reposition on scroll/resize
    const repositionHandler = () => this.positionIcon(icon, field);
    window.addEventListener('scroll', repositionHandler, true);
    window.addEventListener('resize', repositionHandler);
  }

  /**
   * Position icon next to field
   */
  private positionIcon(icon: HTMLElement, field: HTMLInputElement) {
    const rect = field.getBoundingClientRect();
    icon.style.top = `${rect.top + window.scrollY + (rect.height - 20) / 2}px`;
    icon.style.left = `${rect.left + window.scrollX + rect.width - 28}px`;
  }

  /**
   * Show autofill credential selector overlay
   */
  private async showAutofillOverlay(icon: HTMLElement, formId: string) {
    // Remove existing overlay
    this.hideAutofillOverlay();

    // Request credentials from background script
    try {
      const response = await browser.runtime.sendMessage({
        type: 'GET_AUTOFILL_CREDENTIALS',
        url: window.location.href,
      });

      if (!response || !response.success) {
        console.error('Failed to get credentials:', response?.error);
        this.showErrorOverlay(icon, 'Failed to load credentials');
        return;
      }

      const credentials = response.credentials || [];

      // Create overlay
      const overlay = document.createElement('div');
      overlay.className = this.overlayClass;

      // Position overlay
      const iconRect = icon.getBoundingClientRect();
      overlay.style.top = `${iconRect.bottom + window.scrollY + 8}px`;
      overlay.style.left = `${iconRect.left + window.scrollX - 200}px`;

      // Add header
      const header = document.createElement('div');
      header.className = `${this.overlayClass}-header`;
      header.textContent = 'Select credential';
      overlay.appendChild(header);

      if (credentials.length === 0) {
        // Show empty state
        const empty = document.createElement('div');
        empty.className = `${this.overlayClass}-empty`;
        empty.textContent = 'No credentials found for this site';
        overlay.appendChild(empty);
      } else {
        // Add credential items
        credentials.forEach((credential: any) => {
          const item = document.createElement('div');
          item.className = `${this.overlayClass}-item`;

          const title = document.createElement('div');
          title.className = `${this.overlayClass}-item-title`;
          title.textContent = credential.title;

          const username = document.createElement('div');
          username.className = `${this.overlayClass}-item-username`;
          username.textContent = credential.username;

          item.appendChild(title);
          item.appendChild(username);

          // Add click handler
          item.addEventListener('click', () => {
            this.fillCredentials(formId, credential);
            this.hideAutofillOverlay();
          });

          overlay.appendChild(item);
        });
      }

      document.body.appendChild(overlay);

      // Close overlay when clicking outside
      setTimeout(() => {
        document.addEventListener('click', this.handleOutsideClick.bind(this), true);
      }, 0);
    } catch (error) {
      console.error('Error showing autofill overlay:', error);
      this.showErrorOverlay(icon, 'Error loading credentials');
    }
  }

  /**
   * Show error overlay
   */
  private showErrorOverlay(icon: HTMLElement, message: string) {
    const overlay = document.createElement('div');
    overlay.className = this.overlayClass;

    const iconRect = icon.getBoundingClientRect();
    overlay.style.top = `${iconRect.bottom + window.scrollY + 8}px`;
    overlay.style.left = `${iconRect.left + window.scrollX - 200}px`;

    const error = document.createElement('div');
    error.className = `${this.overlayClass}-empty`;
    error.textContent = message;
    overlay.appendChild(error);

    document.body.appendChild(overlay);

    setTimeout(() => {
      this.hideAutofillOverlay();
    }, 2000);
  }

  /**
   * Hide autofill overlay
   */
  private hideAutofillOverlay() {
    const existing = document.querySelector(`.${this.overlayClass}`);
    if (existing) {
      existing.remove();
      document.removeEventListener('click', this.handleOutsideClick.bind(this), true);
    }
  }

  /**
   * Handle clicks outside overlay
   */
  private handleOutsideClick(e: MouseEvent) {
    const target = e.target as HTMLElement;
    if (
      !target.closest(`.${this.overlayClass}`) &&
      !target.closest(`.${this.autofillIconClass}`)
    ) {
      this.hideAutofillOverlay();
    }
  }

  /**
   * Fill credentials into form
   */
  private fillCredentials(formId: string, credential: any) {
    const loginForm = this.detectedForms.get(formId);
    if (!loginForm) return;

    // Fill username
    if (loginForm.usernameField) {
      this.setInputValue(loginForm.usernameField, credential.username);
    }

    // Fill password
    this.setInputValue(loginForm.passwordField, credential.password);

    // Focus on submit button or password field
    if (loginForm.form) {
      const submitButton = loginForm.form.querySelector<HTMLButtonElement>(
        'button[type="submit"], input[type="submit"]'
      );
      if (submitButton) {
        submitButton.focus();
      } else {
        loginForm.passwordField.focus();
      }
    } else {
      loginForm.passwordField.focus();
    }

    console.log('Credentials filled for:', formId);
  }

  /**
   * Set input value and trigger events
   */
  private setInputValue(input: HTMLInputElement, value: string) {
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      'value'
    )?.set;

    if (nativeInputValueSetter) {
      nativeInputValueSetter.call(input, value);
    } else {
      input.value = value;
    }

    // Trigger events to notify frameworks
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
  }

  /**
   * Handle messages from background script
   */
  private handleMessage(message: any): true | Promise<any> {
    if (message.type === 'FILL_CREDENTIALS') {
      const { formId, credential } = message;
      this.fillCredentials(formId, credential);
      return Promise.resolve({ success: true });
    }

    return true;
  }
}

// Initialize content script
new ContentScript();

export {};
