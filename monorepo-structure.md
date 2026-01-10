# Monorepo Structure & Setup Guide (2-Person Team)

## Why Monorepo is PERFECT for Us

**TL;DR**: One repo, all code, maximum efficiency, minimum hassle.

### The Reality of Just Us Two:
- 🚀 **No context switching** - Everything in one place
- 🔄 **Shared code everywhere** - Write crypto once, use everywhere
- 🎯 **Atomic changes** - Change API, update all clients in one commit
- 🤖 **AI-friendly** - I (Claude) can see and work across the entire codebase
- 📦 **Simple deployment** - One CI/CD pipeline to rule them all
- 🧪 **Consistent testing** - Shared test utilities and patterns

---

## Complete Monorepo Structure

```
password-manager/
├── .github/
│   └── workflows/
│       ├── ci.yml                    # Continuous integration
│       ├── deploy-backend.yml        # Deploy backend
│       ├── deploy-extension.yml      # Deploy browser extension
│       └── deploy-mobile.yml         # Mobile app builds
│
├── packages/
│   ├── shared/                       # 🔥 THE CORE - Shared everywhere
│   │   ├── crypto/                   # Encryption/decryption utilities
│   │   │   ├── src/
│   │   │   │   ├── encryption.ts     # AES-256-GCM encryption
│   │   │   │   ├── key-derivation.ts # PBKDF2/Argon2
│   │   │   │   ├── password-gen.ts   # Password generator
│   │   │   │   └── index.ts
│   │   │   ├── tests/
│   │   │   └── package.json
│   │   │
│   │   ├── types/                    # TypeScript types
│   │   │   ├── src/
│   │   │   │   ├── vault.ts          # Vault item types
│   │   │   │   ├── user.ts           # User types
│   │   │   │   ├── sync.ts           # Sync types
│   │   │   │   └── index.ts
│   │   │   └── package.json
│   │   │
│   │   ├── api-client/               # API client library
│   │   │   ├── src/
│   │   │   │   ├── client.ts         # Main API client
│   │   │   │   ├── auth.ts           # Auth endpoints
│   │   │   │   ├── vault.ts          # Vault endpoints
│   │   │   │   ├── sync.ts           # Sync endpoints
│   │   │   │   └── index.ts
│   │   │   └── package.json
│   │   │
│   │   ├── constants/                # Shared constants
│   │   │   ├── src/
│   │   │   │   ├── crypto.ts         # Crypto constants
│   │   │   │   ├── validation.ts     # Validation rules
│   │   │   │   └── index.ts
│   │   │   └── package.json
│   │   │
│   │   └── validators/               # Input validation
│   │       ├── src/
│   │       │   ├── user.ts
│   │       │   ├── vault.ts
│   │       │   └── index.ts
│   │       └── package.json
│   │
│   ├── backend/                      # Node.js API server
│   │   ├── src/
│   │   │   ├── config/               # Configuration
│   │   │   │   ├── database.ts
│   │   │   │   ├── auth.ts
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── controllers/          # Request handlers
│   │   │   │   ├── auth.controller.ts
│   │   │   │   ├── vault.controller.ts
│   │   │   │   └── sync.controller.ts
│   │   │   │
│   │   │   ├── middleware/           # Express middleware
│   │   │   │   ├── auth.middleware.ts
│   │   │   │   ├── error.middleware.ts
│   │   │   │   ├── ratelimit.middleware.ts
│   │   │   │   └── validation.middleware.ts
│   │   │   │
│   │   │   ├── models/               # Database models (if using ORM)
│   │   │   │   ├── user.model.ts
│   │   │   │   └── vault-item.model.ts
│   │   │   │
│   │   │   ├── routes/               # Express routes
│   │   │   │   ├── auth.routes.ts
│   │   │   │   ├── vault.routes.ts
│   │   │   │   ├── sync.routes.ts
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── services/             # Business logic
│   │   │   │   ├── auth.service.ts
│   │   │   │   ├── vault.service.ts
│   │   │   │   ├── sync.service.ts
│   │   │   │   └── database/
│   │   │   │       ├── adapters/
│   │   │   │       │   ├── base.adapter.ts
│   │   │   │       │   ├── postgres.adapter.ts
│   │   │   │       │   ├── mysql.adapter.ts
│   │   │   │       │   └── index.ts
│   │   │   │       └── migrations/
│   │   │   │
│   │   │   ├── utils/                # Utility functions
│   │   │   │   ├── logger.ts
│   │   │   │   ├── jwt.ts
│   │   │   │   └── errors.ts
│   │   │   │
│   │   │   ├── app.ts                # Express app setup
│   │   │   └── server.ts             # Server entry point
│   │   │
│   │   ├── tests/
│   │   │   ├── unit/
│   │   │   ├── integration/
│   │   │   └── e2e/
│   │   │
│   │   ├── .env.example
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── browser-extension/            # Chrome/Firefox extension
│   │   ├── src/
│   │   │   ├── background/           # Service worker
│   │   │   │   ├── service-worker.ts
│   │   │   │   └── message-handler.ts
│   │   │   │
│   │   │   ├── content/              # Content scripts
│   │   │   │   ├── form-detector.ts
│   │   │   │   ├── autofill.ts
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── popup/                # Popup UI (React)
│   │   │   │   ├── components/
│   │   │   │   │   ├── VaultList.tsx
│   │   │   │   │   ├── AddCredential.tsx
│   │   │   │   │   ├── UnlockScreen.tsx
│   │   │   │   │   └── PasswordGenerator.tsx
│   │   │   │   ├── hooks/
│   │   │   │   ├── store/            # Zustand store
│   │   │   │   ├── App.tsx
│   │   │   │   └── index.tsx
│   │   │   │
│   │   │   ├── options/              # Options page
│   │   │   │   └── index.tsx
│   │   │   │
│   │   │   ├── utils/
│   │   │   │   ├── storage.ts        # IndexedDB wrapper
│   │   │   │   ├── sync-queue.ts
│   │   │   │   └── browser-api.ts
│   │   │   │
│   │   │   └── types/
│   │   │
│   │   ├── public/
│   │   │   ├── icons/
│   │   │   │   ├── icon16.png
│   │   │   │   ├── icon48.png
│   │   │   │   └── icon128.png
│   │   │   └── manifest.json
│   │   │
│   │   ├── webpack.config.js
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── mobile/                       # React Native app
│   │   ├── src/
│   │   │   ├── screens/
│   │   │   │   ├── Auth/
│   │   │   │   │   ├── LoginScreen.tsx
│   │   │   │   │   ├── RegisterScreen.tsx
│   │   │   │   │   └── UnlockScreen.tsx
│   │   │   │   ├── Vault/
│   │   │   │   │   ├── VaultListScreen.tsx
│   │   │   │   │   ├── AddCredentialScreen.tsx
│   │   │   │   │   ├── EditCredentialScreen.tsx
│   │   │   │   │   └── ViewCredentialScreen.tsx
│   │   │   │   └── Settings/
│   │   │   │       └── SettingsScreen.tsx
│   │   │   │
│   │   │   ├── components/
│   │   │   │   ├── CredentialCard.tsx
│   │   │   │   ├── PasswordGenerator.tsx
│   │   │   │   └── BiometricPrompt.tsx
│   │   │   │
│   │   │   ├── navigation/
│   │   │   │   └── index.tsx
│   │   │   │
│   │   │   ├── services/
│   │   │   │   ├── biometrics.ts
│   │   │   │   ├── secure-storage.ts
│   │   │   │   └── sync.ts
│   │   │   │
│   │   │   ├── store/                # Zustand store
│   │   │   │   ├── auth.store.ts
│   │   │   │   └── vault.store.ts
│   │   │   │
│   │   │   └── App.tsx
│   │   │
│   │   ├── ios/                      # iOS native code
│   │   │   ├── AutoFillExtension/    # AutoFill Credential Provider
│   │   │   └── Podfile
│   │   │
│   │   ├── android/                  # Android native code
│   │   │   └── app/
│   │   │       └── src/
│   │   │           └── main/
│   │   │               └── java/
│   │   │                   └── AutofillService.kt
│   │   │
│   │   ├── app.json
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── desktop/                      # Electron desktop app
│   │   ├── src/
│   │   │   ├── main/                 # Main process
│   │   │   │   ├── index.ts
│   │   │   │   ├── tray.ts
│   │   │   │   ├── shortcuts.ts
│   │   │   │   └── updater.ts
│   │   │   │
│   │   │   ├── preload/              # Preload scripts
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   └── renderer/             # Renderer process (React)
│   │   │       ├── components/       # Shared with browser extension
│   │   │       └── App.tsx
│   │   │
│   │   ├── electron-builder.yml
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── web-app/                      # (Optional) Web interface
│       ├── src/
│       ├── public/
│       └── package.json
│
├── tools/                            # Build and development tools
│   ├── generators/                   # Code generators
│   │   └── component-generator.js
│   └── scripts/
│       ├── setup.sh                  # Initial setup script
│       └── clean.sh
│
├── docs/                             # Documentation
│   ├── api/                          # API documentation
│   ├── architecture/                 # Architecture docs
│   ├── guides/                       # User guides
│   │   ├── self-hosting.md
│   │   └── security.md
│   └── development/                  # Development guides
│       └── getting-started.md
│
├── scripts/                          # DevOps scripts
│   ├── deploy-backend.sh
│   ├── deploy-extension.sh
│   └── db-migrate.sh
│
├── .gitignore
├── .prettierrc
├── .eslintrc.js
├── package.json                      # Root package.json
├── pnpm-workspace.yaml               # pnpm workspace config
├── turbo.json                        # Turborepo config
├── tsconfig.base.json                # Base TypeScript config
└── README.md
```

---

## Configuration Files

### Root `package.json`

```json
{
  "name": "password-manager",
  "version": "0.1.0",
  "private": true,
  "description": "Secure password manager ecosystem",
  "workspaces": [
    "packages/*"
  ],
  "engines": {
    "node": ">=18.0.0",
    "pnpm": ">=8.0.0"
  },
  "scripts": {
    "dev": "turbo run dev",
    "dev:backend": "turbo run dev --filter=backend",
    "dev:extension": "turbo run dev --filter=browser-extension",
    "dev:mobile": "turbo run dev --filter=mobile",
    
    "build": "turbo run build",
    "build:all": "turbo run build --force",
    
    "test": "turbo run test",
    "test:coverage": "turbo run test -- --coverage",
    
    "lint": "turbo run lint",
    "lint:fix": "turbo run lint -- --fix",
    
    "type-check": "turbo run type-check",
    
    "clean": "turbo run clean && rm -rf node_modules",
    
    "deploy:backend": "turbo run deploy --filter=backend",
    "deploy:extension": "turbo run build --filter=browser-extension && ./scripts/deploy-extension.sh"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "turbo": "^1.10.0",
    "typescript": "^5.2.0",
    "prettier": "^3.0.0",
    "eslint": "^8.50.0",
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@typescript-eslint/parser": "^6.0.0"
  }
}
```

### `pnpm-workspace.yaml`

```yaml
packages:
  - 'packages/*'
  - 'packages/shared/*'
```

### `turbo.json`

```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["**/.env.*local"],
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", "build/**", ".next/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "test": {
      "dependsOn": ["^build"],
      "outputs": ["coverage/**"]
    },
    "lint": {
      "outputs": []
    },
    "type-check": {
      "dependsOn": ["^build"],
      "outputs": []
    },
    "clean": {
      "cache": false
    }
  }
}
```

### `tsconfig.base.json`

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020"],
    "module": "commonjs",
    "moduleResolution": "node",
    "esModuleInterop": true,
    "strict": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "composite": true,
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "exclude": ["node_modules", "dist"]
}
```

### Shared Package `tsconfig.json` Example

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src"],
  "references": []
}
```

### Backend `package.json`

```json
{
  "name": "backend",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "test": "jest",
    "lint": "eslint src --ext .ts",
    "type-check": "tsc --noEmit",
    "migrate": "node dist/services/database/migrations/migrate.js"
  },
  "dependencies": {
    "@password-manager/shared-api-client": "workspace:*",
    "@password-manager/shared-constants": "workspace:*",
    "@password-manager/shared-crypto": "workspace:*",
    "@password-manager/shared-types": "workspace:*",
    "@password-manager/shared-validators": "workspace:*",
    "express": "^4.18.2",
    "express-rate-limit": "^7.0.0",
    "helmet": "^7.0.0",
    "jsonwebtoken": "^9.0.2",
    "pg": "^8.11.0",
    "dotenv": "^16.3.0",
    "cors": "^2.8.5",
    "winston": "^3.10.0"
  },
  "devDependencies": {
    "@types/express": "^4.17.17",
    "@types/jsonwebtoken": "^9.0.2",
    "@types/pg": "^8.10.2",
    "tsx": "^3.12.0",
    "jest": "^29.6.0",
    "@types/jest": "^29.5.3",
    "ts-jest": "^29.1.1"
  }
}
```

### Browser Extension `package.json`

```json
{
  "name": "browser-extension",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "webpack --mode development --watch",
    "build": "webpack --mode production",
    "test": "jest",
    "lint": "eslint src --ext .ts,.tsx"
  },
  "dependencies": {
    "@password-manager/shared-api-client": "workspace:*",
    "@password-manager/shared-constants": "workspace:*",
    "@password-manager/shared-crypto": "workspace:*",
    "@password-manager/shared-types": "workspace:*",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "zustand": "^4.4.0",
    "idb": "^7.1.1"
  },
  "devDependencies": {
    "@types/chrome": "^0.0.245",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "webpack": "^5.88.0",
    "webpack-cli": "^5.1.0",
    "ts-loader": "^9.4.0",
    "html-webpack-plugin": "^5.5.0",
    "copy-webpack-plugin": "^11.0.0"
  }
}
```

---

## Setup Instructions

### 1. Initial Setup

```bash
# Clone the repo
git clone <your-repo-url>
cd password-manager

# Install pnpm (if not already installed)
npm install -g pnpm

# Install all dependencies
pnpm install

# Set up environment variables
cp packages/backend/.env.example packages/backend/.env
# Edit .env with your database credentials

# Run database migrations
cd packages/backend
pnpm run migrate
cd ../..

# Start development servers
pnpm dev
```

### 2. Development Workflow

```bash
# Work on backend only
pnpm dev:backend

# Work on browser extension only
pnpm dev:extension

# Work on mobile app only
pnpm dev:mobile

# Run all tests
pnpm test

# Lint all code
pnpm lint

# Type-check all packages
pnpm type-check
```

### 3. Adding a New Shared Package

```bash
# Create new shared package
mkdir -p packages/shared/my-package/src
cd packages/shared/my-package

# Create package.json
cat > package.json << 'EOF'
{
  "name": "@password-manager/shared-my-package",
  "version": "0.1.0",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch"
  }
}
EOF

# Create tsconfig.json
cat > tsconfig.json << 'EOF'
{
  "extends": "../../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  }
}
EOF

# Install in other packages
cd ../../backend
pnpm add @password-manager/shared-my-package@workspace:*
```

---

## Development Tips for Us Two

### 1. **Use Turborepo's Caching**
- First build might be slow, subsequent builds are FAST
- Turborepo caches build outputs
- Only rebuilds what changed

### 2. **Shared Code Development**
Watch mode for shared packages:
```bash
# Terminal 1: Watch shared crypto package
cd packages/shared/crypto
pnpm dev

# Terminal 2: Watch backend (auto-reloads when crypto changes)
cd packages/backend
pnpm dev
```

### 3. **Quick Testing Across Platforms**
```bash
# Test that a crypto change works everywhere
pnpm test --filter=shared-crypto
pnpm test --filter=backend
pnpm test --filter=browser-extension
```

### 4. **AI-Assisted Development (Me!)**
When you need me to help:
```
You: "Add a new field 'notes' to VaultItem"

Me: I'll update:
1. packages/shared/types/src/vault.ts (add field)
2. packages/backend/src/services/vault.service.ts (handle it)
3. packages/browser-extension/src/popup/components/AddCredential.tsx (UI)
4. packages/mobile/src/screens/Vault/AddCredentialScreen.tsx (UI)
5. Database migration script
6. All tests

One change, consistent everywhere!
```

---

## Why This Structure Works for Us

✅ **Single source of truth** for types and crypto  
✅ **AI (me) can work across the entire codebase** easily  
✅ **No version mismatches** between packages  
✅ **Fast iterations** with hot reload everywhere  
✅ **Simple CI/CD** - one workflow file  
✅ **Easy debugging** - all code in one place  
✅ **Share code naturally** - import like normal packages  

---

## Next Steps

1. **You**: Initialize the Git repo
2. **Me**: Generate all the boilerplate code
3. **You**: Set up database (Supabase free tier?)
4. **Together**: Start with Phase 1 (Backend + Extension)

Ready to get started? 🚀
