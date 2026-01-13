# iForgotPassword - Firefox Add-ons Listing

## Summary (250 characters max)
A secure, privacy-focused password manager with zero-knowledge encryption. Your master password never leaves your device. Features auto-fill, password generator, multi-device sync, and offline support. Open architecture for transparency.

## Description

iForgotPassword is a modern password manager that puts your privacy first. Built with a zero-knowledge architecture, your sensitive data is encrypted on your device before it ever reaches our servers.

### Why Choose iForgotPassword?

**True Zero-Knowledge Architecture**
Unlike other password managers that claim to be secure, we mathematically prove it. Your master password is used to derive two keys locally: one for authentication (hashed before sending), and one for encryption (never leaves your device). Not even we can decrypt your data.

**Security Features**
- AES-256-GCM encryption (military-grade)
- PBKDF2 key derivation (100,000+ iterations)
- Master password never transmitted
- Automatic vault locking
- HTTPS-only auto-fill
- No password length limits

**Auto-fill That Works**
- Intelligent login form detection
- Works with modern web frameworks (React, Vue, Angular)
- Subdomain matching
- Visual key icon indicator
- Keyboard shortcuts

**Offline-First Design**
- Full functionality without internet
- Local IndexedDB storage
- Encrypted local cache
- Automatic sync when reconnected

**Multi-Device Synchronization**
- Real-time sync across devices
- Conflict resolution (last-write-wins)
- Background sync every 5 minutes
- Offline queue for pending changes

**Password Generator**
- Customizable length (8-64 characters)
- Character type selection
- Memorable passphrase mode
- Password strength meter
- Crack time estimation
- Exclude ambiguous characters

**Clean & Intuitive UI**
- Modern React-based interface
- Dark mode support (coming soon)
- Quick search functionality
- Type filtering
- Responsive design

### Privacy Commitment

We believe in radical transparency:
- No tracking or analytics
- No telemetry collection
- No data mining
- No advertising
- Open security architecture
- Future open-source release planned

### How It Works

1. Install the extension
2. Create an account with a strong master password
3. Add your passwords, cards, notes, and identities
4. Use auto-fill on websites by clicking the key icon
5. Your encrypted data syncs across devices automatically

### Technical Details

- Client-side encryption only
- Server stores encrypted blobs
- JWT authentication with refresh tokens
- Rate limiting and account lockout protection
- Optimistic locking for conflict prevention
- IndexedDB for local storage

### Upcoming Features

- Mobile apps (iOS & Android)
- Desktop applications (Windows, macOS, Linux)
- Self-hosting support
- 2FA/TOTP generator
- Secure notes with rich text
- Password health audit
- Breach monitoring
- Import from other password managers

### Support

- GitHub: https://github.com/lennoxstark47/iForgotPassword
- Email: support@iforgotpassword.app
- Documentation: https://iforgotpassword.app/docs

### Open Development

Follow our development on GitHub! We welcome community feedback and contributions.

---

**Current Version: 0.1.0 (Beta)**

This is an early release. Please report bugs and request features on our GitHub repository!
