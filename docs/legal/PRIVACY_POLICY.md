# Privacy Policy for iForgotPassword

**Last Updated: January 13, 2026**

## Introduction

iForgotPassword ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we handle your data when you use our password manager service.

## Our Zero-Knowledge Commitment

**We cannot access your data.** This is not a marketing claim—it's a mathematical guarantee. Our zero-knowledge architecture ensures that your master password and unencrypted vault data never leave your device.

## Information We Collect

### Information You Provide

1. **Email Address**
   - Used solely for account identification
   - Not used for marketing without explicit consent
   - Can be pseudonymous (we don't verify email addresses currently)

2. **Encrypted Vault Data**
   - Passwords, credit cards, secure notes, and identities
   - **Encrypted on your device before transmission**
   - We cannot decrypt this data

3. **Authentication Information**
   - Derived authentication key (hashed version of your master password)
   - Key derivation function (KDF) parameters
   - We never see your actual master password

### Information Collected Automatically

1. **Technical Information**
   - Device ID (randomly generated, stored locally)
   - Sync timestamps
   - API request logs (IP address, endpoint, timestamp)
   - Error logs (no sensitive data included)

2. **Usage Data**
   - Number of vault items
   - Last sync time
   - Account creation date
   - Login timestamps

### Information We Do NOT Collect

- Your master password (never transmitted)
- Unencrypted vault contents
- Browsing history
- Websites you visit
- Auto-fill usage patterns
- Analytics or telemetry data
- Advertising identifiers

## How We Use Your Information

1. **Provide the Service**
   - Authenticate your account
   - Store encrypted vault data
   - Synchronize across your devices
   - Prevent unauthorized access

2. **Security & Fraud Prevention**
   - Rate limiting
   - Account lockout after failed login attempts
   - Detect and prevent abuse

3. **Service Improvement**
   - Error monitoring (crash logs without sensitive data)
   - Performance optimization
   - Bug fixes

4. **Legal Compliance**
   - Respond to valid legal requests
   - Enforce our Terms of Service

## How We Share Your Information

**We do not sell, rent, or share your personal information with third parties** except in the following limited circumstances:

1. **Service Providers**
   - Cloud hosting (database and API servers)
   - These providers have no access to encryption keys

2. **Legal Requirements**
   - When required by law
   - To protect our rights or safety
   - In response to valid legal process

3. **Business Transfers**
   - In case of merger, acquisition, or sale of assets
   - Your rights under this policy would continue

### What We CAN Share (Because It's Encrypted)

Even if compelled by law, we can only provide:
- Your email address
- Encrypted vault data (useless without your master password)
- Account metadata (creation date, sync times)
- IP addresses from server logs

**We cannot provide:**
- Your master password (we don't have it)
- Unencrypted vault contents (we can't decrypt them)
- Your encryption key (it never leaves your device)

## Data Storage and Security

### Encryption

- **Client-side encryption:** AES-256-GCM
- **Key derivation:** PBKDF2 with 100,000+ iterations
- **Transport security:** TLS 1.3
- **At-rest encryption:** Database-level encryption

### Storage Location

- **Servers:** Cloud hosting (region: US/EU depending on deployment)
- **Local storage:** Your device (IndexedDB)
- **Backups:** Encrypted database backups

### Data Retention

- **Active accounts:** Data retained indefinitely while account is active
- **Inactive accounts:** After 2 years of inactivity, we may delete your account and encrypted data
- **Deleted accounts:** Data purged within 30 days of deletion request

## Your Rights

You have the right to:

1. **Access Your Data**
   - Download your encrypted vault data
   - Request account information

2. **Correct Your Data**
   - Update your email address
   - Modify vault contents

3. **Delete Your Data**
   - Delete individual vault items
   - Delete your entire account
   - Request complete data removal

4. **Export Your Data**
   - Export vault in JSON format
   - Includes encrypted data you can decrypt locally

5. **Restrict Processing**
   - Opt out of optional features
   - Limit data collection

### How to Exercise Your Rights

- **In-app:** Use settings page to manage data
- **Email:** support@iforgotpassword.app
- **Response time:** Within 30 days

## Data Security Measures

We implement industry-standard security practices:

- Zero-knowledge architecture
- End-to-end encryption
- Secure key derivation
- Rate limiting and account lockout
- Regular security audits
- Secure coding practices
- Dependency vulnerability scanning
- TLS for all communications

## Children's Privacy

iForgotPassword is not intended for users under 13 years of age. We do not knowingly collect information from children. If you believe a child has provided us with personal information, please contact us.

## International Users

### GDPR Compliance (European Users)

If you are in the European Economic Area (EEA), you have additional rights:

- Right to data portability
- Right to object to processing
- Right to lodge a complaint with supervisory authority
- Right to withdraw consent

**Legal basis for processing:**
- **Consent:** You consent when creating an account
- **Contract:** Necessary to provide the service
- **Legitimate interests:** Security and fraud prevention

### Data Transfers

Your data may be transferred to and processed in countries other than your own. We ensure adequate protection through:
- Standard contractual clauses
- Encryption in transit and at rest
- Zero-knowledge architecture (data is encrypted before transfer)

## Cookies and Tracking

### We DO NOT Use

- Advertising cookies
- Third-party tracking pixels
- Analytics cookies (e.g., Google Analytics)
- Social media tracking

### We DO Use

- **Session tokens:** JWT tokens for authentication (stored in browser session storage)
- **Local preferences:** Theme, language settings (localStorage)
- **Device ID:** Random identifier for sync (localStorage)

All storage is local to your browser—no tracking across websites.

## Changes to This Policy

We may update this Privacy Policy occasionally. Changes will be posted on this page with an updated "Last Updated" date.

**Material changes** will be notified via:
- Email to registered address
- In-app notification
- Website announcement

Continued use after changes constitutes acceptance.

## Third-Party Services

We may use the following third-party services:

1. **Cloud Hosting Provider**
   - Purpose: Database and API hosting
   - Data access: Encrypted vault data only
   - Location: [TBD based on deployment]

2. **Error Monitoring (Optional)**
   - Purpose: Crash and error reporting
   - Data: Error logs without sensitive information
   - Provider: [TBD if implemented]

Each service complies with GDPR and has appropriate data protection agreements.

## Open Source and Transparency

We are committed to transparency:
- Security architecture publicly documented
- Future plans to open-source client code
- Community security audits encouraged
- Bug bounty program (planned)

## Contact Us

For privacy questions, concerns, or requests:

**Email:** privacy@iforgotpassword.app
**GitHub:** https://github.com/lennoxstark47/iForgotPassword
**Address:** [To be added when registered]

Response time: Within 5 business days for general inquiries, 30 days for formal requests.

## Legal

This Privacy Policy is governed by the laws of [Jurisdiction TBD]. Any disputes will be resolved in accordance with our Terms of Service.

---

**Your privacy is our priority. We built iForgotPassword with zero-knowledge architecture specifically so we can't access your data—even if we wanted to.**
