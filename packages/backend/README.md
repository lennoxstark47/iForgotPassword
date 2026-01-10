# Backend API Server

Express.js REST API server for iForgotPassword password manager.

## Overview

This is the backend API server that handles:
- User authentication and authorization
- Encrypted vault storage and retrieval
- Multi-device synchronization
- Database operations with adapter pattern

## Features

- **Zero-Knowledge Security**: Server never has access to unencrypted vault data
- **JWT Authentication**: Secure token-based authentication with refresh tokens
- **Database Adapters**: Support for multiple database types (PostgreSQL, MySQL, MongoDB)
- **Rate Limiting**: Protection against brute force attacks
- **Input Validation**: Comprehensive validation using shared validators
- **Error Handling**: Structured error responses
- **Logging**: Winston-based logging system
- **TypeScript**: Full type safety

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- PostgreSQL >= 14.0 (or compatible database)
- pnpm >= 8.0.0

### Installation

From the root of the monorepo:

```bash
pnpm install
```

### Configuration

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` with your configuration:
   ```env
   PORT=3000
   NODE_ENV=development

   DATABASE_TYPE=postgresql
   DATABASE_HOST=localhost
   DATABASE_PORT=5432
   DATABASE_NAME=iforgotpassword
   DATABASE_USER=postgres
   DATABASE_PASSWORD=your_password

   JWT_SECRET=your_jwt_secret
   JWT_REFRESH_SECRET=your_refresh_secret
   ```

3. Run database migrations:
   ```bash
   pnpm run migrate
   ```

### Development

Start the development server with hot reload:

```bash
pnpm dev
```

The server will start on `http://localhost:3000`

### Building

Build the TypeScript code:

```bash
pnpm build
```

### Production

Start the production server:

```bash
pnpm start
```

## API Documentation

### Base URL

```
http://localhost:3000/api/v1
```

### Authentication Endpoints

#### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "authKey": "base64_encoded_auth_key",
  "salt": "base64_encoded_salt",
  "kdfIterations": 100000,
  "kdfAlgorithm": "PBKDF2"
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "authKey": "base64_encoded_auth_key",
  "deviceId": "uuid",
  "deviceName": "Chrome Extension"
}
```

#### Refresh Token
```http
POST /auth/refresh
Content-Type: application/json

{
  "refreshToken": "your_refresh_token"
}
```

### Vault Endpoints

All vault endpoints require the `Authorization` header:

```http
Authorization: Bearer {access_token}
```

#### Get All Vault Items
```http
GET /vault/items?limit=50&offset=0&since=2024-01-01T00:00:00Z
```

#### Get Vault Item
```http
GET /vault/items/{item_id}
```

#### Create Vault Item
```http
POST /vault/items
Content-Type: application/json

{
  "encryptedData": "base64_encrypted_data",
  "encryptedKey": "base64_encrypted_key",
  "iv": "base64_iv",
  "authTag": "base64_auth_tag",
  "itemType": "login",
  "urlDomain": "example.com",
  "deviceId": "uuid"
}
```

#### Update Vault Item
```http
PUT /vault/items/{item_id}
Content-Type: application/json

{
  "encryptedData": "base64_encrypted_data",
  "encryptedKey": "base64_encrypted_key",
  "iv": "base64_iv",
  "authTag": "base64_auth_tag",
  "version": 1,
  "deviceId": "uuid"
}
```

#### Delete Vault Item
```http
DELETE /vault/items/{item_id}
```

## Project Structure

```
src/
├── config/              # Configuration management
├── controllers/         # Request handlers
│   ├── auth.controller.ts
│   └── vault.controller.ts
├── middleware/          # Express middleware
│   ├── auth.middleware.ts
│   ├── error.middleware.ts
│   └── ratelimit.middleware.ts
├── routes/              # API routes
│   ├── auth.routes.ts
│   ├── vault.routes.ts
│   └── index.ts
├── services/            # Business logic
│   └── database/        # Database layer
│       ├── adapters/    # Database adapters
│       │   ├── base.adapter.ts
│       │   ├── postgres.adapter.ts
│       │   └── index.ts
│       ├── migrations/  # Database migrations
│       │   ├── init.sql
│       │   └── migrate.ts
│       └── index.ts
├── utils/               # Utility functions
│   ├── errors.ts
│   ├── jwt.ts
│   └── logger.ts
├── app.ts               # Express app setup
└── server.ts            # Server entry point
```

## Database

### Supported Databases

- PostgreSQL (default)
- MySQL (coming soon)
- MongoDB (coming soon)

### Schema

The database uses the adapter pattern, allowing support for multiple database types. The PostgreSQL schema includes:

- `users` - User accounts
- `vault_items` - Encrypted vault items
- `sync_metadata` - Multi-device sync tracking
- `folders` - Item organization
- `audit_logs` - Security audit trail

### Migrations

Run migrations to set up the database:

```bash
pnpm run migrate
```

This will create all necessary tables, indexes, and triggers.

## Security

### Rate Limiting

- Login attempts: 5 per 15 minutes
- Registration attempts: 3 per 15 minutes
- General API requests: 100 per 15 minutes

### Account Lockout

After 5 failed login attempts, accounts are locked for 30 minutes.

### JWT Tokens

- Access tokens: 15-minute expiration
- Refresh tokens: 7-day expiration

### Encryption

All vault data is encrypted client-side with:
- Algorithm: AES-256-GCM
- Key derivation: PBKDF2 with 100,000 iterations
- Zero-knowledge architecture (server never sees plaintext)

## Testing

Run tests:

```bash
pnpm test
```

Run tests with coverage:

```bash
pnpm test:coverage
```

## Logging

The server uses Winston for logging. Logs include:

- Request logging
- Error logging
- Database operations
- Authentication events

In production, logs are written to:
- `logs/error.log` - Error logs
- `logs/combined.log` - All logs

## Error Handling

All errors return a consistent JSON structure:

```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "statusCode": 400,
    "details": {}
  }
}
```

## Health Check

Check server health:

```http
GET /health
```

Response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-10T12:00:00.000Z"
}
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `NODE_ENV` | Environment | `development` |
| `DATABASE_TYPE` | Database type | `postgresql` |
| `DATABASE_HOST` | Database host | `localhost` |
| `DATABASE_PORT` | Database port | `5432` |
| `DATABASE_NAME` | Database name | `iforgotpassword` |
| `DATABASE_USER` | Database user | `postgres` |
| `DATABASE_PASSWORD` | Database password | - |
| `JWT_SECRET` | JWT secret key | - |
| `JWT_REFRESH_SECRET` | Refresh token secret | - |
| `CORS_ORIGIN` | Allowed origins | `http://localhost:3000` |

## License

TBD
