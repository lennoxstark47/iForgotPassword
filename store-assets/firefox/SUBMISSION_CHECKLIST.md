# Firefox Add-ons Submission Checklist

## Pre-Submission Requirements

### 1. Extension Build
- [x] Extension built successfully
- [x] All features working correctly
- [x] No console errors
- [ ] Test in Firefox browser
- [ ] Test in Firefox ESR (Extended Support Release)
- [ ] Test in Firefox Developer Edition

### 2. Manifest Adjustments for Firefox
- [ ] **TODO:** Create manifest_firefox.json if needed (or ensure V3 compatibility)
- [ ] Verify browser compatibility
- [ ] Test: `web-ext lint` for validation
- [ ] Ensure no Chrome-only APIs used
- [ ] Test background service worker in Firefox

### 3. Required Assets

#### Icons (Required)
- [x] 48x48 PNG icon (minimum)
- [x] 128x128 PNG icon (recommended)
- [ ] **Optional:** 96x96 PNG icon (recommended for Firefox)

#### Screenshots (Required - at least 1)
- [ ] **TODO:** Create screenshots (various sizes accepted, 1280x800 recommended)
- [ ] Screenshot 1: Vault interface
- [ ] Screenshot 2: Password generator
- [ ] Screenshot 3: Auto-fill demo
- [ ] Screenshot 4: Settings page

Note: Firefox is more flexible with screenshot sizes than Chrome

### 4. Legal & Documentation
- [x] Privacy policy written
- [x] Terms of service written
- [ ] **TODO:** Upload privacy policy to public URL
- [ ] **Required:** Privacy policy URL in submission form
- [ ] **Required:** Homepage URL (GitHub or landing page)
- [ ] **Required:** Support email or URL

### 5. Developer Account
- [ ] **TODO:** Create Firefox Add-ons Developer account (FREE)
- [ ] **TODO:** Verify email
- [ ] **Optional:** Add 2FA for account security

### 6. Add-on Information

#### Listing Details
- [x] Name: "iForgotPassword"
- [x] Summary (max 250 chars)
- [x] Full description
- [ ] Version: 0.1.0
- [ ] License: TBD (must choose a license)
- [ ] Tags/Categories

#### Categories (Select up to 2)
- Primary: **Security & Privacy**
- Secondary: **Productivity**

#### Tags
- password manager
- security
- encryption
- privacy
- autofill
- password generator
- zero-knowledge

### 7. Source Code Submission

**IMPORTANT:** Firefox requires source code if extension is built/minified

Options:
1. **Upload source code** + build instructions
2. **Link to public GitHub repository** (recommended)
3. Only if code is NOT minified/obfified can you skip this

For our case:
- [ ] **TODO:** Ensure GitHub repo is public
- [ ] **TODO:** Provide GitHub URL: https://github.com/lennoxstark47/iForgotPassword
- [ ] **TODO:** Create BUILD.md with clear build instructions
- [ ] **TODO:** Tag release: v0.1.0

### 8. Build Instructions Document
Create clear instructions for reviewers:

```markdown
# Build Instructions

## Prerequisites
- Node.js >= 18.0.0
- pnpm >= 8.0.0

## Build Steps
1. Clone repository: `git clone https://github.com/lennoxstark47/iForgotPassword.git`
2. Install dependencies: `pnpm install`
3. Build extension: `pnpm build`
4. Output in: `packages/browser-extension/dist/`

## Verify Build
Compare built files with uploaded ZIP to verify reproducibility.
```

### 9. Version & Release Notes
- [ ] Version: 0.1.0
- [ ] Release notes:
```
Initial beta release of iForgotPassword

Features:
- Zero-knowledge encryption (AES-256-GCM)
- Vault management (CRUD operations)
- Password generator with strength analysis
- Auto-fill for login forms
- Multi-device sync
- Offline-first architecture
- Background sync worker

This is a beta release. Feedback welcome on GitHub!
```

### 10. Distribution Settings

#### Visibility Options
- **On this site:** Public, listed
- **Unlisted:** Available via direct link only
- **Self-distribution:** Download from own site

For beta, recommend: **Unlisted** initially

#### Platforms
- [x] Firefox for Desktop
- [ ] Firefox for Android (test separately)

#### Version Compatibility
- Minimum: Firefox 109 (Manifest V3 support)
- Maximum: Latest

### 11. Testing Requirements

#### Functionality Testing
- [ ] Fresh install test
- [ ] Registration flow
- [ ] Login flow
- [ ] Vault CRUD
- [ ] Sync functionality
- [ ] Auto-fill on popular sites
- [ ] Password generator
- [ ] Settings changes
- [ ] Offline mode
- [ ] Auto-lock
- [ ] Extension updates

#### Browser Compatibility
- [ ] Firefox stable (latest)
- [ ] Firefox ESR
- [ ] Firefox Developer Edition
- [ ] Firefox Beta (optional)

#### Performance
- [ ] Extension loads quickly
- [ ] No memory leaks
- [ ] Smooth UI interactions
- [ ] Sync performance with many items

### 12. Permissions Review

Firefox reviewers scrutinize permissions. Justify each:

- **storage:** Store encrypted vault data locally
- **activeTab:** Inject auto-fill on user-visited pages
- **alarms:** Background sync every 5 minutes

- **host_permissions:**
  - `http://localhost:3000/*` - Development API (remove for production?)
  - `https://api.iforgotpassword.app/*` - Production API

### 13. Final Pre-Submission Checks

#### Code Quality
- [ ] Remove console.log in production code
- [ ] Remove debug statements
- [ ] Update API URL to production
- [ ] No hardcoded credentials
- [ ] Comments and code are professional

#### Documentation
- [ ] README.md complete
- [ ] BUILD.md created
- [ ] Privacy policy live
- [ ] Support contact active

#### Legal
- [ ] Choose open source license (MIT, GPL, etc.) or proprietary
- [ ] Ensure compliance with license for dependencies
- [ ] Privacy policy compliant with GDPR

### 14. Package Creation

#### Create Firefox Build
```bash
cd /home/user/iForgotPassword/packages/browser-extension
pnpm build

# Create zip (exclude unnecessary files)
cd dist
zip -r ../../../firefox-addon-v0.1.0.zip . -x "*.map" "*.DS_Store"

# Verify zip contents
unzip -l ../../../firefox-addon-v0.1.0.zip
```

#### Create Source Code Package
```bash
cd /home/user/iForgotPassword
git archive --format=zip --output=firefox-addon-source-v0.1.0.zip HEAD
```

## Submission Process

### Step 1: Create Firefox Add-ons Account
1. Go to [addons.mozilla.org](https://addons.mozilla.org)
2. Click "Register" or "Log in"
3. Verify email
4. Go to [Developer Hub](https://addons.mozilla.org/developers/)

### Step 2: Submit New Add-on
1. Click "Submit a New Add-on"
2. Choose distribution: "On this site"
3. Upload `firefox-addon-v0.1.0.zip`

### Step 3: Fill Submission Form

#### Add-on Details
- Name: iForgotPassword
- Summary: (Use prepared summary)
- Description: (Use prepared description)
- Categories: Security & Privacy, Productivity
- Tags: password manager, security, encryption, etc.
- License: Choose license
- Privacy Policy URL: https://iforgotpassword.app/privacy
- Homepage: https://github.com/lennoxstark47/iForgotPassword
- Support email: support@iforgotpassword.app

#### Screenshots
- Upload prepared screenshots
- Add captions for each

#### Icons
- Upload 48x48, 96x96, 128x128 icons

#### Version Information
- Version: 0.1.0
- Release notes: (Use prepared notes)
- Compatibility: Firefox 109+
- License: (As chosen)

#### Source Code
- **Option 1:** Link to GitHub repo (easier)
- **Option 2:** Upload source ZIP + BUILD.md

#### Notes to Reviewer
```
This is the initial beta release of iForgotPassword, a privacy-focused password manager.

Build Instructions:
- Node.js 18+ and pnpm required
- Run: pnpm install && pnpm build
- Source code: https://github.com/lennoxstark47/iForgotPassword
- Tagged release: v0.1.0

The extension uses:
- Vite for bundling (generates the built files)
- Manifest V3 (Firefox compatible)
- Zero-knowledge encryption (all crypto client-side)

Permissions justification:
- storage: Local encrypted vault
- activeTab: Auto-fill functionality
- alarms: Background sync
- host_permissions: API access for sync

Feel free to contact support@iforgotpassword.app with any questions.
```

### Step 4: Automated Validation

Firefox runs automatic checks:
- Manifest validation
- Code scanning for common issues
- Permissions review
- File size check
- Metadata validation

Wait for automated validation to complete (~1 minute).

### Step 5: Manual Review Queue

- **Timeline:** 1-7 days (varies)
- **Faster if:** Clear code, good documentation, open source
- **Slower if:** Complex, many permissions, large codebase

### Step 6: Review Outcomes

#### Approved
- Add-on goes live immediately (or scheduled)
- Listed on AMO (if public)
- Auto-update enabled for users

#### Rejected
- Email with reasons
- Can resubmit after fixes
- Common reasons: permissions, code quality, policy violations

#### Information Requested
- Reviewer needs clarification
- Respond promptly via developer hub

## Post-Submission

### Monitor Review Status
- [ ] Check developer hub daily
- [ ] Respond to reviewer questions within 24 hours
- [ ] Update submission if requested

### After Approval
- [ ] Test published version
- [ ] Announce to beta testers
- [ ] Monitor reviews and ratings
- [ ] Set up AMO statistics tracking
- [ ] Plan version 0.2.0

## Common Rejection Reasons (Avoid These)

1. **Source Code Issues**
   - Not providing source when required
   - Source doesn't match build
   - Missing build instructions
   - ✓ Solution: Public GitHub + clear BUILD.md

2. **Permissions Overreach**
   - Requesting unnecessary permissions
   - ✓ Solution: Only what's needed, justify in reviewer notes

3. **Malicious Code Detection**
   - Minified/obfuscated code without source
   - Remote code execution
   - ✓ Solution: Vite builds are acceptable with source

4. **Privacy Issues**
   - No privacy policy
   - Data collection not disclosed
   - ✓ Solution: Clear privacy policy

5. **Incomplete Listing**
   - Missing required fields
   - Poor descriptions
   - ✓ Solution: Complete all fields thoroughly

## Firefox vs Chrome Differences

| Aspect | Chrome | Firefox |
|--------|--------|---------|
| Review Time | 1-3 days | 1-7 days |
| Source Code | Not required | Required if built |
| Developer Fee | $5 one-time | FREE |
| Update Review | Fast | Moderate |
| Rejection Rate | Moderate | Higher (stricter) |
| Appeals | Available | Available |

## Resources

- **Developer Hub:** https://addons.mozilla.org/developers/
- **Documentation:** https://extensionworkshop.com/
- **Submission Guide:** https://extensionworkshop.com/documentation/publish/submitting-an-add-on/
- **Review Policies:** https://extensionworkshop.com/documentation/publish/add-on-policies/
- **Source Code Policy:** https://extensionworkshop.com/documentation/publish/source-code-submission/
- **web-ext Tool:** https://extensionworkshop.com/documentation/develop/getting-started-with-web-ext/

## Using web-ext for Testing

Install and use web-ext CLI tool:

```bash
# Install globally
npm install -g web-ext

# Run extension in Firefox
cd packages/browser-extension/dist
web-ext run

# Lint extension
web-ext lint

# Build signed XPI (after published)
web-ext sign --api-key=$AMO_JWT_ISSUER --api-secret=$AMO_JWT_SECRET
```

## Post-Launch Monitoring

### Week 1
- [ ] Monitor for crashes
- [ ] Respond to user reviews
- [ ] Track installation stats
- [ ] Check support emails

### Week 2-4
- [ ] Gather feedback
- [ ] Plan improvements
- [ ] Fix critical bugs
- [ ] Prepare update

## Notes

- Firefox review is more thorough than Chrome
- Open source extensions reviewed faster
- Good documentation = faster approval
- Be responsive to reviewer questions
- Version updates reviewed (but faster than initial)
