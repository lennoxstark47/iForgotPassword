# Chrome Web Store Submission Checklist

## Pre-Submission Requirements

### 1. Extension Build
- [x] Extension built successfully
- [x] All features working correctly
- [x] No console errors
- [ ] Test in Chrome browser
- [ ] Test in different Chrome versions (latest stable, beta)

### 2. Required Assets

#### Icons (Required)
- [x] 16x16 PNG icon
- [x] 32x32 PNG icon
- [x] 48x48 PNG icon
- [x] 128x128 PNG icon
- [ ] **TODO:** 440x280 PNG marquee promotional tile (for featured placement)

#### Screenshots (Required - at least 1, max 5)
- [ ] **TODO:** Create 1280x800 or 640x400 screenshots
- [ ] Screenshot 1: Vault overview
- [ ] Screenshot 2: Password generator
- [ ] Screenshot 3: Auto-fill in action
- [ ] Screenshot 4: Settings page
- [ ] Screenshot 5: Login screen

#### Store Listing
- [x] Short description (max 132 characters)
- [x] Detailed description
- [ ] Category: Productivity
- [ ] Language: English
- [ ] **TODO:** Small promotional tile 440x280 (optional but recommended)

### 3. Legal & Documentation
- [x] Privacy policy written
- [x] Terms of service written
- [ ] **TODO:** Upload privacy policy to public URL
- [ ] **TODO:** Upload terms of service to public URL
- [ ] **Required:** Privacy policy URL in manifest or store listing

### 4. Developer Account
- [ ] **TODO:** Create Chrome Web Store Developer account ($5 one-time fee)
- [ ] **TODO:** Verify developer identity
- [ ] **TODO:** Set up payment method (if planning paid features)

### 5. Manifest.json Review
- [x] manifest_version: 3 ✓
- [x] name: "iForgotPassword" ✓
- [x] version: "0.1.0" ✓
- [x] description ✓
- [x] icons defined ✓
- [x] permissions appropriate ✓
- [ ] **Review:** host_permissions - consider removing localhost for production
- [ ] **Optional:** Add homepage_url to manifest

### 6. Code Quality
- [ ] Remove console.log statements (production)
- [ ] Remove debug code
- [ ] Minify/optimize code (vite handles this)
- [ ] Test with production API URL
- [ ] Ensure no hardcoded secrets

### 7. Testing
- [ ] Test fresh install
- [ ] Test registration flow
- [ ] Test login flow
- [ ] Test vault CRUD operations
- [ ] Test sync functionality
- [ ] Test auto-fill on popular sites (Gmail, GitHub, Twitter, etc.)
- [ ] Test password generator
- [ ] Test settings
- [ ] Test offline mode
- [ ] Test with slow network
- [ ] Test auto-lock
- [ ] Test with 100+ passwords

### 8. Store Listing Content

#### Category
- Primary: **Productivity**
- Secondary: **Security & Privacy**

#### Age Rating
- **Everyone** (no age restrictions)

#### Content Ratings
- No violent content
- No sexual content
- No gambling
- No user-generated content

### 9. Distribution Settings
- [ ] Choose visibility: Public / Unlisted / Private
- [ ] For beta: Start with **Unlisted** (only users with link can install)
- [ ] Select regions: All regions or specific countries
- [ ] Language: English (add more later)

### 10. Privacy Practices Declaration
Chrome Web Store requires declaration of:

#### Data Collection
- [ ] Declare: Email addresses (for authentication)
- [ ] Declare: Encrypted user data
- [ ] Declare: Sync timestamps
- [ ] Declare: NO personally identifiable information
- [ ] Declare: NO browsing history
- [ ] Declare: NO financial data (we store encrypted only)

#### Data Usage
- [ ] Purpose: App functionality
- [ ] Purpose: Authentication
- [ ] NOT for advertising
- [ ] NOT for analytics
- [ ] NOT sold to third parties

#### Security Practices
- [ ] Data encrypted in transit (TLS)
- [ ] Data encrypted at rest
- [ ] Zero-knowledge architecture
- [ ] User can request deletion

### 11. Final Checks Before Upload
- [ ] Build extension: `pnpm build`
- [ ] Create zip: `cd packages/browser-extension/dist && zip -r ../../chrome-extension.zip .`
- [ ] Test zip installation manually
- [ ] Version number correct
- [ ] All links in description work
- [ ] Privacy policy live and accessible
- [ ] Terms of service live and accessible
- [ ] Support email active: support@iforgotpassword.app

## Submission Process

### Step 1: Create Zip File
```bash
cd /home/user/iForgotPassword/packages/browser-extension
pnpm build
cd dist
zip -r ../../../chrome-extension-v0.1.0.zip .
```

### Step 2: Upload to Chrome Web Store
1. Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
2. Pay $5 developer registration fee (one-time)
3. Click "New Item"
4. Upload `chrome-extension-v0.1.0.zip`
5. Fill in all store listing fields
6. Upload screenshots and promotional images
7. Add privacy policy URL
8. Complete privacy practices questionnaire
9. Submit for review

### Step 3: Review Process
- **Timeline:** 1-3 days typically
- **May request:** Additional information
- **May reject if:** Permissions too broad, privacy issues, policy violations
- **Appeals:** Available if rejected

### Step 4: Post-Submission
- [ ] Monitor review status daily
- [ ] Respond to any reviewer questions within 24 hours
- [ ] Test published extension after approval
- [ ] Share link with beta testers
- [ ] Monitor user reviews and ratings

## Common Rejection Reasons to Avoid

1. **Permissions Issues**
   - ✓ Only request necessary permissions
   - ✓ Justify in description why each permission needed
   - ✓ We use: storage, activeTab, alarms (all justified)

2. **Privacy Policy Issues**
   - ✓ Must be publicly accessible
   - ✓ Must explain data collection clearly
   - ✓ Must match actual practices

3. **Misleading Functionality**
   - ✓ Description matches actual features
   - ✓ Screenshots show real interface
   - ✓ No false promises

4. **Code Quality**
   - ✓ No obfuscated code (unless justified)
   - ✓ No remote code execution
   - ✓ All code in extension package

5. **Branding Issues**
   - ✓ Not impersonating another brand
   - ✓ Original icon and name
   - ✓ Clear about being independent

## Post-Launch Monitoring

### Week 1
- [ ] Monitor for crashes (check reviews)
- [ ] Respond to all user reviews
- [ ] Track installation numbers
- [ ] Monitor support emails

### Week 2-4
- [ ] Gather user feedback
- [ ] Plan version 0.2.0 improvements
- [ ] Address any critical bugs
- [ ] Consider featured placement request (after 50+ users)

## Resources

- **Developer Dashboard:** https://chrome.google.com/webstore/devconsole
- **Documentation:** https://developer.chrome.com/docs/webstore/
- **Policy Guidelines:** https://developer.chrome.com/docs/webstore/program-policies/
- **Branding Guidelines:** https://developer.chrome.com/docs/webstore/branding/
- **Best Practices:** https://developer.chrome.com/docs/webstore/best_practices/

## Notes for Future Updates

- Version updates review faster (usually same day)
- Can publish unlisted versions for testing
- A/B testing available for listings
- Analytics available in dashboard
- Can schedule releases
