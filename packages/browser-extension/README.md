# iForgotPassword Browser Extension

Browser extension for Chrome and Firefox with zero-knowledge password management.

## Features

### Week 1-2 (Foundation) ✅
- Chrome Manifest V3 extension structure
- React + TypeScript + Tailwind UI
- Master password unlock flow
- Local encrypted storage (IndexedDB)
- Session management
- Backend API integration
- Zero-knowledge key derivation

### Week 3-4 (Vault Management) ✅
- Add/Edit/Delete credentials with full CRUD operations
- Password generator with configurable options
  - Password mode with length, character types, exclusions
  - Passphrase mode for memorable passwords
  - Strength indicator and crack time estimation
- Search and filter functionality
- Settings page with security and advanced options
- Vault item display with copy functionality
- Confirmation dialogs for destructive actions
- Sync functionality with backend server

### Week 5-6 (Auto-fill) - Coming Soon
- Auto-fill integration
- Browser context menu integration

## Development

### Install Dependencies

```bash
pnpm install
```

### Build Extension

```bash
# Development build with watch mode
pnpm dev

# Production build
pnpm build
```

### Load Extension in Browser

#### Chrome/Edge
1. Navigate to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `packages/browser-extension/dist` folder

#### Firefox
1. Navigate to `about:debugging#/runtime/this-firefox`
2. Click "Load Temporary Add-on"
3. Select the `manifest.json` file from `packages/browser-extension/dist`

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Logo.tsx
│   └── Loading.tsx
├── pages/              # Page components
│   ├── popup.html      # Extension popup HTML
│   ├── popup.tsx       # Popup entry point
│   ├── Welcome.tsx     # Welcome screen
│   ├── Login.tsx       # Login page
│   ├── Register.tsx    # Registration page
│   ├── Unlock.tsx      # Unlock screen
│   └── Vault.tsx       # Vault view
├── services/           # Business logic services
│   ├── api.ts          # Backend API client
│   ├── auth.ts         # Authentication service
│   └── crypto.ts       # Cryptography utilities
├── storage/            # Data persistence
│   ├── indexedDB.ts    # IndexedDB for vault items
│   ├── sessionStorage.ts  # Session data (tokens, keys)
│   └── localStorage.ts # Persistent settings
├── store/              # State management
│   └── appStore.ts     # Zustand store
├── styles/             # CSS styles
│   └── index.css       # Tailwind + custom styles
├── types/              # TypeScript types
│   └── index.ts
├── App.tsx             # Main app component
├── background.ts       # Background service worker
├── content.ts          # Content script
└── manifest.json       # Extension manifest
```

## Architecture

### Zero-Knowledge Flow

1. **Registration/Login:**
   - User enters email + master password
   - Client derives two keys using PBKDF2:
     - **Auth Key**: Sent to server for authentication
     - **Encryption Key**: Stays in browser, never sent to server
   - Encryption key stored in session storage (cleared on lock)

2. **Data Encryption:**
   - All vault items encrypted with AES-256-GCM
   - Encryption happens client-side before sync
   - Server stores only encrypted blobs

3. **Session Management:**
   - Auto-lock after 15 minutes of inactivity
   - Manual lock clears encryption key
   - JWT tokens for API authentication

### Storage Layers

- **IndexedDB**: Encrypted vault items (offline access)
- **Session Storage**: Encryption key + JWT tokens (cleared on lock)
- **Local Storage**: User settings + device ID (persists)

## Security Features

- Zero-knowledge architecture
- AES-256-GCM encryption
- PBKDF2 key derivation (100,000+ iterations)
- Auto-lock on inactivity
- Secure session management
- No plaintext data transmission

## API Integration

Connects to backend API at `http://localhost:3000` (configurable):

- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/refresh` - Token refresh
- `GET /api/v1/vault/items` - Get vault items
- `POST /api/v1/sync/pull` - Pull changes from server
- `POST /api/v1/sync/push` - Push changes to server

## Testing

```bash
# Run tests (Week 4)
pnpm test

# Type checking
pnpm type-check

# Linting
pnpm lint
```

## Features Implemented

### Vault Management (Week 3-4) ✅
- **Full CRUD Operations**: Create, read, update, and delete vault items
- **Password Generator**: Generate secure passwords with customizable options
  - Adjustable length (8-64 characters)
  - Character type selection (uppercase, lowercase, numbers, symbols)
  - Ambiguous character exclusion option
  - Passphrase generation for memorable passwords
  - Real-time strength analysis with crack time estimation
- **Search & Filter**: Real-time search across all vault fields with type filtering
- **Settings Management**:
  - Auto-lock timeout configuration
  - API server URL customization
  - Theme selection (light/dark)
  - Account management (logout, clear data)
- **User Experience**:
  - Copy-to-clipboard functionality
  - Show/hide password toggle
  - Confirmation dialogs for destructive actions
  - Sync with backend server
  - Empty state handling

## Next Steps (Week 5-6)

1. Implement auto-fill detection and injection
2. Add browser context menu integration
3. Implement content script for form detection
4. Add comprehensive tests
5. Performance optimization

## License

TBD
