# iForgotPassword

A secure, self-hostable password manager ecosystem with cross-platform support.

## Project Overview

iForgotPassword is a comprehensive password management solution built with security and user control at its core. The project uses a **zero-knowledge architecture**, ensuring that your master password and unencrypted data never leave your device.

### Key Features

- **Zero-Knowledge Architecture**: End-to-end encryption with AES-256-GCM
- **Cross-Platform Support**: Browser extensions, mobile apps (iOS/Android), and desktop applications
- **Self-Hosting Capable**: Use our cloud or host your own database
- **Secure Sync**: Multi-device synchronization with conflict resolution
- **Monorepo Structure**: Shared code across all platforms for consistency

## Project Structure

This is a monorepo managed with **pnpm workspaces** and **Turborepo**:

```
iForgotPassword/
├── packages/
│   ├── shared/              # Shared libraries
│   │   ├── crypto/          # Encryption, key derivation, password generation
│   │   ├── types/           # TypeScript type definitions
│   │   ├── constants/       # Application constants
│   │   └── validators/      # Input validation
│   ├── backend/             # Node.js API server
│   ├── browser-extension/   # Chrome/Firefox extension (coming soon)
│   ├── mobile/              # React Native app (coming soon)
│   └── desktop/             # Electron desktop app (coming soon)
├── docs/                    # Documentation
└── scripts/                 # DevOps scripts
```

## Technology Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: PostgreSQL (primary), with adapter pattern for MySQL/MongoDB support
- **Authentication**: JWT with refresh tokens
- **Encryption**: Node.js native crypto (AES-256-GCM, PBKDF2)

### Shared Packages
- **Language**: TypeScript
- **Build Tool**: TypeScript compiler
- **Package Manager**: pnpm
- **Monorepo**: Turborepo

## Getting Started

### Prerequisites

- **Node.js**: >= 18.0.0
- **pnpm**: >= 8.0.0
- **PostgreSQL**: >= 14.0

### Installation

1. **Install pnpm** (if not already installed):
   ```bash
   npm install -g pnpm
   ```

2. **Install dependencies**:
   ```bash
   pnpm install
   ```

3. **Set up environment variables**:
   ```bash
   cp packages/backend/.env.example packages/backend/.env
   ```

   Edit `packages/backend/.env` with your database credentials.

4. **Set up the database**:

   Create a PostgreSQL database:
   ```bash
   createdb iforgotpassword
   ```

   Run migrations:
   ```bash
   pnpm --filter backend run migrate
   ```

5. **Build all packages**:
   ```bash
   pnpm build
   ```

6. **Start development server**:
   ```bash
   pnpm dev:backend
   ```

   The API will be available at `http://localhost:3000`

## Development

### Available Scripts

```bash
# Development
pnpm dev                  # Run all packages in dev mode
pnpm dev:backend          # Run backend only
pnpm dev:extension        # Run browser extension only

# Building
pnpm build                # Build all packages
pnpm build:all            # Force rebuild all packages

# Testing
pnpm test                 # Run all tests
pnpm test:coverage        # Run tests with coverage

# Linting
pnpm lint                 # Lint all packages
pnpm lint:fix             # Fix linting issues

# Type checking
pnpm type-check           # Type check all packages

# Cleaning
pnpm clean                # Clean all build artifacts
```

### Working with Shared Packages

The shared packages are automatically built when you build dependent packages thanks to Turborepo's dependency graph.

To work on a shared package and see changes in real-time:

```bash
# Terminal 1: Watch shared package
cd packages/shared/crypto
pnpm dev

# Terminal 2: Watch backend
cd packages/backend
pnpm dev
```

### Database Migrations

To run migrations:
```bash
pnpm --filter backend run migrate
```

The migration script will set up all necessary tables and indexes.

## API Endpoints

### Authentication

- `POST /api/v1/auth/register` - Register a new user
- `POST /api/v1/auth/login` - Login user
- `POST /api/v1/auth/refresh` - Refresh access token

### Vault

- `GET /api/v1/vault/items` - Get all vault items
- `GET /api/v1/vault/items/:id` - Get a specific vault item
- `POST /api/v1/vault/items` - Create a vault item
- `PUT /api/v1/vault/items/:id` - Update a vault item
- `DELETE /api/v1/vault/items/:id` - Delete a vault item

### Health

- `GET /health` - Health check endpoint

## Security

### Zero-Knowledge Architecture

1. **Master Password**: Never sent to server
2. **Key Derivation**: PBKDF2 with 100,000 iterations (configurable)
3. **Key Splitting**:
   - Authentication Key (sent to server, hashed)
   - Encryption Key (stays local, encrypts vault)
4. **Encryption**: AES-256-GCM for all vault data
5. **Transport**: TLS 1.3 for all communications

### Best Practices

- All sensitive data is encrypted before leaving the client
- Server stores only encrypted blobs
- Authentication uses JWT with short expiration
- Rate limiting on all endpoints
- Input validation on all requests

## Project Timeline

### Phase 1: MVP - Backend + Browser Extension (Months 1-4)

**Current Status**: Month 1, Week 1-2 ✅

#### ✅ Completed (Week 1-2)
- Monorepo setup with pnpm + Turborepo
- Shared crypto library
- Shared types, constants, validators
- Backend scaffolding with Express
- PostgreSQL database setup
- Database adapter pattern
- Authentication endpoints
- Vault CRUD endpoints

#### 🚧 Next Steps (Week 3-4)
- Complete sync endpoints
- Add comprehensive tests
- Set up CI/CD pipeline
- Begin browser extension development

## Contributing

This is currently a personal project, but contributions are welcome! Please ensure:

1. All code follows the existing style (enforced by ESLint/Prettier)
2. All tests pass
3. Type checking passes
4. Security best practices are followed

## License

TBD

## Roadmap

See [project-planning.md](./project-planning.md) for detailed roadmap and milestones.

## Documentation

- [Project Planning](./project-planning.md)
- [System Design & Architecture](./system-design-architecture.md)
- [Monorepo Structure](./monorepo-structure.md)

## Support

For issues and questions, please open an issue on GitHub.

---

Built with ❤️ and security in mind.
