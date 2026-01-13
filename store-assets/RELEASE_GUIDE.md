# iForgotPassword - Release Guide (Month 4, Week 3-4)

**Version:** 0.1.0 Beta
**Date:** January 13, 2026
**Status:** Ready for Store Submission

## Overview

This guide documents the complete release process for iForgotPassword browser extension, including preparation, submission, and post-launch activities.

## Release Deliverables Status

### ✅ Completed

1. **Extension Build**
   - [x] All packages built successfully
   - [x] Extension tested and working
   - [x] Production-ready code

2. **Store Submission Assets**
   - [x] Chrome Web Store description prepared
   - [x] Firefox Add-ons description prepared
   - [x] Submission checklists created
   - [x] Icons ready (16, 32, 48, 128px)

3. **Legal Documentation**
   - [x] Privacy Policy written
   - [x] Terms of Service written
   - [x] GDPR compliance considerations included

4. **Technical Documentation**
   - [x] BUILD.md created for reviewers
   - [x] README.md updated
   - [x] Detailed submission checklists

5. **Landing Page**
   - [x] Basic HTML landing page created
   - [x] Features highlighted
   - [x] Links to documentation

### 🚧 Remaining Tasks

6. **Screenshots & Promotional Images**
   - [ ] Create 5 screenshots (1280x800) for Chrome
   - [ ] Create 4 screenshots for Firefox
   - [ ] Create 440x280 promotional tile (Chrome)
   - [ ] Add captions to screenshots

7. **Developer Accounts**
   - [ ] Create Chrome Web Store Developer account ($5)
   - [ ] Create Firefox Add-ons Developer account (free)
   - [ ] Verify email addresses

8. **Production Deployment**
   - [ ] Deploy landing page to hosting
   - [ ] Set up production API endpoint
   - [ ] Configure domain (iforgotpassword.app)
   - [ ] Deploy privacy policy & ToS to public URLs

9. **Store Submissions**
   - [ ] Submit to Chrome Web Store
   - [ ] Submit to Firefox Add-ons
   - [ ] Monitor review process

10. **Beta User Onboarding**
    - [ ] Create beta tester guide
    - [ ] Set up feedback collection system
    - [ ] Prepare support email (support@iforgotpassword.app)

## Step-by-Step Release Process

### Phase 1: Pre-Submission (1-2 days)

#### 1.1 Create Screenshots

Use a tool like Chrome DevTools device emulation or actual browser windows:

**Required Screenshots:**
1. **Vault Overview** - Show populated vault with multiple items
2. **Password Generator** - Show generator with options
3. **Auto-fill Demo** - Show key icon on login form
4. **Settings Page** - Show configuration options
5. **Login Screen** - Show clean login interface

**Screenshot Specifications:**
- **Chrome:** 1280x800 or 640x400 (PNG or JPEG)
- **Firefox:** Various sizes accepted, 1280x800 recommended
- **Quality:** High quality, no artifacts
- **Content:** Real-looking data (no Lorem Ipsum)

**Tools:**
- macOS: `Cmd+Shift+4` for screenshots
- Windows: Snipping Tool or `Win+Shift+S`
- Linux: `gnome-screenshot` or Spectacle
- Browser: DevTools screenshot tool

**Screenshot Checklist:**
```bash
mkdir -p store-assets/screenshots
# Take 5 screenshots and save as:
# - vault-overview.png
# - password-generator.png
# - autofill-demo.png
# - settings-page.png
# - login-screen.png
```

#### 1.2 Create Promotional Tile (Chrome)

**Specifications:**
- Size: 440x280 pixels
- Format: PNG or JPEG
- Design: Feature app icon, name, and key value proposition

**Tools:**
- Figma (free tier)
- Canva
- Photoshop / GIMP
- Simple CSS/HTML mockup

**Content:**
- App icon (🔐)
- App name: "iForgotPassword"
- Tagline: "Zero-Knowledge Password Manager"
- Visual appeal: Use brand colors (purple gradient)

#### 1.3 Deploy Landing Page & Documentation

**Hosting Options:**
- **GitHub Pages** (free, easy)
- **Vercel** (free tier)
- **Netlify** (free tier)
- **CloudFlare Pages** (free)

**Deploy to GitHub Pages (Recommended):**

```bash
# Create gh-pages branch
cd /home/user/iForgotPassword
git checkout -b gh-pages

# Copy website files to root
cp -r website/* .
cp -r docs .

# Commit and push
git add .
git commit -m "Deploy landing page"
git push origin gh-pages

# Enable GitHub Pages in repo settings
# Settings → Pages → Source: gh-pages branch
```

**Result:**
- Landing page: `https://lennoxstark47.github.io/iForgotPassword/`
- Privacy policy: `https://lennoxstark47.github.io/iForgotPassword/docs/legal/PRIVACY_POLICY.html`
- Terms: `https://lennoxstark47.github.io/iForgotPassword/docs/legal/TERMS_OF_SERVICE.html`

**Alternative: Custom Domain**

If using custom domain (iforgotpassword.app):
1. Purchase domain (~$10-15/year)
2. Configure DNS to point to hosting
3. Enable HTTPS (automatic with most hosts)
4. Update all links in store listings

#### 1.4 Set Up Production API

**Option A: Use Existing Backend**
- Deploy backend to cloud (Railway, Render, Fly.io)
- Update extension manifest with production API URL
- Test full registration → sync → autofill flow

**Option B: Keep Development Mode**
- For beta, can use localhost API
- Instruct beta testers to run backend locally
- Include setup instructions in beta guide

**Recommended for Beta:** Option B (simpler for initial release)

#### 1.5 Update Extension Manifest

Update `packages/browser-extension/src/manifest.json`:

```json
{
  "version": "0.1.0",
  "host_permissions": [
    "https://api.iforgotpassword.app/*"
  ]
}
```

Remove localhost permission for production release.

#### 1.6 Final Build & Package

```bash
cd /home/user/iForgotPassword

# Clean build
pnpm clean
pnpm install
pnpm build

# Verify build
cd packages/browser-extension/dist
ls -la

# Create Chrome package
zip -r ../../../chrome-extension-v0.1.0.zip .

# Create Firefox package
zip -r ../../../firefox-addon-v0.1.0.zip . -x "*.map"

# Create source package for Firefox
cd ../../..
git archive --format=zip --output=firefox-addon-source-v0.1.0.zip HEAD
```

**Verify packages:**
```bash
# Check file sizes
ls -lh *.zip

# Verify contents
unzip -l chrome-extension-v0.1.0.zip | head -20
unzip -l firefox-addon-v0.1.0.zip | head -20
```

### Phase 2: Chrome Web Store Submission (Day 1)

#### 2.1 Create Developer Account

1. Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
2. Sign in with Google account
3. Pay $5 developer registration fee
4. Complete developer profile

#### 2.2 Upload Extension

1. Click "New Item"
2. Upload `chrome-extension-v0.1.0.zip`
3. Wait for automatic validation (~1 minute)
4. Fix any errors reported

#### 2.3 Complete Store Listing

**Product details:**
- Category: Productivity
- Language: English

**Store listing:**
- Detailed description: (Copy from `store-assets/chrome/description.md`)
- Promotional images: Upload screenshots
- Promotional tile: Upload 440x280 image
- Icon: Already in manifest

**Privacy:**
- Privacy policy URL: `https://lennoxstark47.github.io/iForgotPassword/docs/legal/PRIVACY_POLICY.html`
- Permissions justification: See submission checklist

**Privacy practices:**
- Data collection: Email (authentication), encrypted vault data
- Data usage: App functionality only
- Data sharing: None
- Security: Encryption, zero-knowledge

**Distribution:**
- Visibility: **Unlisted** (for beta)
- Regions: All
- Pricing: Free

#### 2.4 Submit for Review

1. Review all information
2. Click "Submit for Review"
3. Wait for review (1-3 days typical)

#### 2.5 Monitor Review

- Check dashboard daily
- Respond to any questions within 24 hours
- Be prepared to provide additional info

### Phase 3: Firefox Add-ons Submission (Day 1-2)

#### 3.1 Create Developer Account

1. Go to [Firefox Add-ons Developer Hub](https://addons.mozilla.org/developers/)
2. Sign in or create account (free)
3. Verify email
4. Complete profile

#### 3.2 Submit Add-on

1. Click "Submit a New Add-on"
2. Choose: "On this site"
3. Upload `firefox-addon-v0.1.0.zip`
4. Wait for automated validation

#### 3.3 Complete Submission Form

**Add-on Information:**
- Name: iForgotPassword
- Summary: (250 chars from `store-assets/firefox/description.md`)
- Description: (Full description)
- Categories: Security & Privacy, Productivity
- Tags: password manager, security, encryption, autofill
- License: Choose (MIT recommended for open source plans)

**Version Details:**
- Version: 0.1.0
- Release notes: (See Firefox checklist)
- Compatibility: Firefox 109+

**Links & Support:**
- Homepage: `https://github.com/lennoxstark47/iForgotPassword`
- Support site: Same or landing page
- Support email: `support@iforgotpassword.app`
- Privacy policy: `https://lennoxstark47.github.io/iForgotPassword/docs/legal/PRIVACY_POLICY.html`

**Media:**
- Upload screenshots with captions
- Upload icon (if not in manifest)

#### 3.4 Source Code Submission

**Option 1: Link to GitHub** (Recommended)
- Provide: `https://github.com/lennoxstark47/iForgotPassword`
- Tag: `v0.1.0`
- Mention: "See BUILD.md for build instructions"

**Option 2: Upload Source ZIP**
- Upload `firefox-addon-source-v0.1.0.zip`
- Include BUILD.md in repo root

#### 3.5 Notes to Reviewer

```
Initial beta release of iForgotPassword, a zero-knowledge password manager.

Source Code:
- GitHub: https://github.com/lennoxstark47/iForgotPassword
- Tag: v0.1.0
- Build instructions: See BUILD.md in repository

Build Process:
- Built with Vite (Node.js 18+, pnpm)
- Run: pnpm install && pnpm build
- Output: packages/browser-extension/dist/

Permissions Justification:
- storage: Encrypted vault storage (IndexedDB)
- activeTab: Auto-fill login forms on user action
- alarms: Background sync every 5 minutes
- host_permissions: API access for cloud sync

Architecture:
- Zero-knowledge encryption (AES-256-GCM)
- Client-side encryption only
- Server stores encrypted blobs only
- No tracking or analytics

Contact: support@iforgotpassword.app for questions.
```

#### 3.6 Submit & Monitor

1. Submit for review
2. Check status daily (1-7 days review time)
3. Respond promptly to any questions

### Phase 4: Beta User Onboarding (Days 3-30)

#### 4.1 Prepare Beta Guide

Create `BETA_TESTING_GUIDE.md`:

```markdown
# iForgotPassword Beta Testing Guide

Thank you for testing iForgotPassword! Your feedback is invaluable.

## Installation

**Chrome:**
[Unlisted link from Chrome Web Store after approval]

**Firefox:**
[Unlisted link from Firefox Add-ons after approval]

## Getting Started

1. Install extension
2. Click extension icon
3. Register with email and master password
4. Add your first password
5. Try auto-fill on a website

## What to Test

- [ ] Registration and login
- [ ] Adding/editing/deleting passwords
- [ ] Password generator
- [ ] Auto-fill on various websites
- [ ] Sync across devices
- [ ] Search and filtering
- [ ] Settings changes
- [ ] Offline mode

## Known Issues

- Beta version, expect some bugs
- Limited browser support initially
- API may be slow (development server)

## Reporting Issues

- **GitHub:** https://github.com/lennoxstark47/iForgotPassword/issues
- **Email:** support@iforgotpassword.app

## Feedback Form

[Link to Google Form or similar]

## Important Reminders

- **Backup your master password** - we cannot recover it
- This is beta software - don't use for critical passwords yet
- Data loss may occur - keep backups

Thank you for being an early adopter! 🎉
```

#### 4.2 Recruit Beta Testers

**Sources:**
- Friends and family (5-10 people)
- Tech-savvy colleagues
- Online communities (Reddit, HackerNews, ProductHunt)
- GitHub followers

**Invitation:**
```
Hey! I'm launching iForgotPassword, a privacy-focused password manager.

Looking for beta testers to try it out and provide feedback.

What's special:
- Zero-knowledge encryption
- Open architecture
- No tracking

Interested? [Link to beta guide]
```

#### 4.3 Set Up Support Channels

1. **Email:** support@iforgotpassword.app
   - Forward to personal email initially
   - Use Gmail or ProtonMail

2. **GitHub Issues:**
   - Enable issues on repository
   - Create issue templates
   - Monitor daily

3. **Feedback Form:**
   - Google Forms (free)
   - Typeform (free tier)
   - Simple survey

#### 4.4 Monitor Beta Period

**Daily Tasks:**
- Check store reviews
- Check GitHub issues
- Check support email
- Monitor error rates (if error tracking enabled)

**Weekly Tasks:**
- Analyze feedback
- Prioritize bug fixes
- Plan next version features
- Update beta testers on progress

### Phase 5: Post-Launch (Days 7-30)

#### 5.1 Initial Response (Days 1-7)

- Respond to all reviews (positive and negative)
- Fix critical bugs immediately
- Release hotfix if necessary (v0.1.1)
- Thank beta testers publicly

#### 5.2 Gather Metrics

**Installation Stats:**
- Chrome: Check Web Store dashboard
- Firefox: Check AMO statistics

**Usage Patterns:**
- Most used features
- Common issues
- Feature requests

**Performance:**
- Load times
- Crash rates
- Sync reliability

#### 5.3 Plan Version 0.2.0

Based on feedback, prioritize:
- Critical bug fixes
- Most requested features
- UX improvements
- Performance optimizations

**Example v0.2.0 features:**
- Import from other password managers
- Dark mode
- Additional autofill improvements
- Better error messages
- Keyboard shortcuts

#### 5.4 Consider Full Public Release

After 2-4 weeks of successful beta:
- Change visibility to **Public** on both stores
- Announce on social media
- Submit to ProductHunt
- Write blog post / announcement

### Phase 6: Ongoing Maintenance

#### Regular Updates

- Bug fix releases: As needed
- Feature releases: Monthly
- Security updates: Immediately as needed

#### Community Engagement

- Respond to issues within 48 hours
- Monthly update posts
- Transparency about roadmap
- Consider accepting contributions

#### Store Optimization

- Update screenshots as UI improves
- Improve description based on user questions
- Add more languages
- Request featured placement (after 100+ users, high ratings)

## Appendix

### Useful Commands

```bash
# Build release
pnpm build

# Create packages
cd packages/browser-extension/dist
zip -r ../../../chrome-extension-v$(node -p "require('./manifest.json').version").zip .
zip -r ../../../firefox-addon-v$(node -p "require('./manifest.json').version").zip . -x "*.map"

# Tag release
git tag -a v0.1.0 -m "Beta release v0.1.0"
git push origin v0.1.0

# Deploy landing page
git checkout gh-pages
git merge main
git push origin gh-pages
```

### Important Links

- **Chrome Dashboard:** https://chrome.google.com/webstore/devconsole
- **Firefox Dashboard:** https://addons.mozilla.org/developers/addons
- **GitHub Repo:** https://github.com/lennoxstark47/iForgotPassword
- **Landing Page:** https://lennoxstark47.github.io/iForgotPassword/

### Success Metrics

**Week 1:**
- [ ] 10+ installations
- [ ] No critical bugs
- [ ] All beta testers onboarded

**Week 2:**
- [ ] 25+ installations
- [ ] Positive reviews (4+ stars)
- [ ] Sync working reliably

**Week 4:**
- [ ] 50+ installations
- [ ] Active user feedback
- [ ] v0.2.0 planned

**Month 3:**
- [ ] 100+ installations
- [ ] Ready for public launch
- [ ] Mobile apps in development

## Troubleshooting

### Extension Rejected

1. Read rejection reason carefully
2. Fix issues mentioned
3. Update code/listing
4. Resubmit with explanation
5. Appeal if rejection seems unfair

### Low Installation Rate

1. Improve store listing
2. Better screenshots
3. Clearer value proposition
4. Marketing efforts
5. Ask for reviews from satisfied users

### Bug Reports

1. Reproduce locally
2. Fix in develop branch
3. Test thoroughly
4. Release patch version
5. Update users via store listing

---

**This is a living document. Update as you learn from the release process.**

**Good luck with the launch! 🚀**
