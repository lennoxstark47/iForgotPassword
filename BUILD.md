# Build Instructions for iForgotPassword Browser Extension

This document provides step-by-step instructions for building the iForgotPassword browser extension from source code. These instructions are intended for store reviewers, contributors, and users who want to build the extension themselves.

## Prerequisites

Before building, ensure you have the following installed:

- **Node.js:** >= 18.0.0 ([Download](https://nodejs.org/))
- **pnpm:** >= 8.0.0 (Package manager)

### Installing pnpm

If you don't have pnpm installed:

```bash
npm install -g pnpm
```

Or via Corepack (recommended):

```bash
corepack enable
corepack prepare pnpm@latest --activate
```

## Quick Build (TL;DR)

```bash
git clone https://github.com/lennoxstark47/iForgotPassword.git
cd iForgotPassword
pnpm install
pnpm build
# Extension files in: packages/browser-extension/dist/
```

## Detailed Build Instructions

### Step 1: Clone the Repository

```bash
git clone https://github.com/lennoxstark47/iForgotPassword.git
cd iForgotPassword
```

For a specific release:

```bash
git clone https://github.com/lennoxstark47/iForgotPassword.git
cd iForgotPassword
git checkout v0.1.0  # Replace with desired version
```

### Step 2: Install Dependencies

This project uses a monorepo structure with pnpm workspaces. Install all dependencies:

```bash
pnpm install
```

This will install dependencies for all packages in the monorepo:
- `packages/browser-extension` - The browser extension
- `packages/shared/crypto` - Encryption utilities
- `packages/shared/types` - TypeScript types
- `packages/shared/constants` - Shared constants
- `packages/shared/validators` - Input validators
- `packages/backend` - Backend API (not needed for extension build)

**Expected output:** Success message with number of packages installed.

### Step 3: Build All Packages

Build the entire project (including dependencies):

```bash
pnpm build
```

This uses Turborepo to build packages in the correct order:
1. Shared packages (`crypto`, `types`, `constants`, `validators`)
2. Browser extension

**Build time:** ~10-20 seconds on modern hardware.

**Expected output:**
```
✓ @iforgotpassword/shared-crypto:build
✓ @iforgotpassword/shared-types:build
✓ @iforgotpassword/shared-constants:build
✓ @iforgotpassword/shared-validators:build
✓ @iforgotpassword/browser-extension:build
```

### Step 4: Verify Build Output

The built extension files are in:

```
packages/browser-extension/dist/
```

**Expected structure:**

```
dist/
├── src/
│   ├── manifest.json
│   ├── background.js
│   ├── content.js
│   ├── pages/
│   │   └── popup.html
│   └── assets/
│       ├── icon-16.png
│       ├── icon-32.png
│       ├── icon-48.png
│       └── icon-128.png
├── popup.js
└── assets/
    └── popup-*.css
```

### Step 5: Load Extension in Browser

#### Chrome/Edge

1. Open `chrome://extensions/`
2. Enable "Developer mode" (top right)
3. Click "Load unpacked"
4. Select `packages/browser-extension/dist/` folder
5. Extension should now be loaded

#### Firefox

1. Open `about:debugging#/runtime/this-firefox`
2. Click "Load Temporary Add-on"
3. Navigate to `packages/browser-extension/dist/src/`
4. Select `manifest.json`
5. Extension should now be loaded

### Step 6: Create Distribution Package

#### For Chrome Web Store

```bash
cd packages/browser-extension/dist
zip -r ../../../chrome-extension-v0.1.0.zip .
```

#### For Firefox Add-ons

```bash
cd packages/browser-extension/dist
zip -r ../../../firefox-addon-v0.1.0.zip . -x "*.map"
```

## Build Scripts Explained

### Root Level Scripts

- `pnpm build` - Build all packages in correct order
- `pnpm dev` - Start development mode for all packages
- `pnpm clean` - Remove all build artifacts
- `pnpm test` - Run all tests
- `pnpm lint` - Lint all packages

### Extension-Specific Scripts

```bash
cd packages/browser-extension

# Development with hot reload
pnpm dev

# Production build
pnpm build

# Type checking
pnpm type-check

# Linting
pnpm lint
```

## Build Configuration

### Vite Configuration

The extension uses Vite for bundling. Configuration in:
- `packages/browser-extension/vite.config.ts`

Key settings:
- **Entry points:** popup.html, background.ts, content.ts
- **Output:** dist/
- **Bundling:** Rollup-based, optimized for production
- **Source maps:** Generated for debugging

### TypeScript Configuration

TypeScript settings in:
- `packages/browser-extension/tsconfig.json`
- Root `tsconfig.json` (base configuration)

Key settings:
- **Target:** ES2020
- **Module:** ESNext
- **Strict mode:** Enabled
- **Path mappings:** For shared packages

## Development Workflow

### Watch Mode (Hot Reload)

For active development:

```bash
# Terminal 1: Watch shared packages
cd packages/shared/crypto
pnpm dev

# Terminal 2: Watch extension
cd packages/browser-extension
pnpm dev
```

Changes to TypeScript files trigger automatic rebuilds.

### Testing Changes

After making changes:

```bash
pnpm build
# Reload extension in browser
```

**Chrome:** Click refresh icon on extension card
**Firefox:** Click "Reload" button in about:debugging

## Troubleshooting

### Issue: "turbo: not found"

**Solution:** Install dependencies first:
```bash
pnpm install
```

### Issue: "Cannot find module '@iforgotpassword/shared-*'"

**Solution:** Build shared packages first:
```bash
pnpm build
```

### Issue: Build fails with TypeScript errors

**Solution:** Check Node.js and pnpm versions:
```bash
node --version  # Should be >= 18.0.0
pnpm --version  # Should be >= 8.0.0
```

### Issue: Extension doesn't load in browser

**Solution:**
1. Check for console errors in browser
2. Verify manifest.json exists in dist/src/
3. Ensure all required files built correctly

### Issue: Changes not reflected after rebuild

**Solution:**
1. Hard reload extension in browser
2. Clear browser cache
3. Restart browser if necessary

## Verifying Build Authenticity

To verify that a published build matches the source:

1. Clone repository at specific tag:
   ```bash
   git clone https://github.com/lennoxstark47/iForgotPassword.git
   cd iForgotPassword
   git checkout v0.1.0
   ```

2. Build from source:
   ```bash
   pnpm install
   pnpm build
   ```

3. Compare built files:
   ```bash
   # Your built files
   ls -lR packages/browser-extension/dist/

   # Published extension (unzip first)
   unzip chrome-extension-v0.1.0.zip -d published/
   ls -lR published/
   ```

**Note:** Some variation in generated files (timestamps, hash in filenames) is normal due to build tools.

## Production Build Checklist

Before creating a production build:

- [ ] Update version in `package.json`
- [ ] Update `CHANGELOG.md`
- [ ] Run tests: `pnpm test`
- [ ] Lint code: `pnpm lint`
- [ ] Type check: `pnpm type-check`
- [ ] Update API URL to production
- [ ] Remove debug code and console.logs
- [ ] Build: `pnpm build`
- [ ] Test extension manually
- [ ] Create distribution ZIP
- [ ] Tag release: `git tag v0.1.0`

## Continuous Integration

Our GitHub Actions workflow automatically:
1. Installs dependencies
2. Builds all packages
3. Runs tests
4. Creates release artifacts

See `.github/workflows/build.yml` for configuration.

## Additional Resources

- **Project Documentation:** [README.md](./README.md)
- **Architecture:** [system-design-architecture.md](./system-design-architecture.md)
- **Monorepo Structure:** [monorepo-structure.md](./monorepo-structure.md)
- **API Documentation:** [packages/backend/README.md](./packages/backend/README.md)

## Support

If you encounter issues building:

- **GitHub Issues:** https://github.com/lennoxstark47/iForgotPassword/issues
- **Email:** support@iforgotpassword.app
- **Discussions:** https://github.com/lennoxstark47/iForgotPassword/discussions

## License

[TBD - Add license information]

---

**Last Updated:** 2026-01-13
**Version:** 0.1.0
