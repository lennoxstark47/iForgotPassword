# Password Manager Ecosystem - System Design & Architecture

## Architecture Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Applications                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ Browser  │  │   iOS    │  │ Android  │  │ Desktop  │   │
│  │Extension │  │   App    │  │   App    │  │   Apps   │   │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘   │
└───────┼─────────────┼─────────────┼─────────────┼──────────┘
        │             │             │             │
        └─────────────┴─────────────┴─────────────┘
                       │
                       ▼
        ┌──────────────────────────┐
        │      API Gateway         │
        │   (Load Balancer)        │
        └──────────┬───────────────┘
                   │
        ┌──────────▼───────────────┐
        │   Backend Services       │
        │   (Node.js/Express)      │
        │                          │
        │  ┌────────────────────┐  │
        │  │ Auth Service       │  │
        │  ├────────────────────┤  │
        │  │ Sync Service       │  │
        │  ├────────────────────┤  │
        │  │ Vault Service      │  │
        │  ├────────────────────┤  │
        │  │ User Service       │  │
        │  └────────────────────┘  │
        └──────────┬───────────────┘
                   │
        ┌──────────▼───────────────┐
        │   Database Layer         │
        │  ┌────────────────────┐  │
        │  │ PostgreSQL         │  │
        │  │ (or User's DB)     │  │
        │  └────────────────────┘  │
        └──────────────────────────┘
```

---

## Security Architecture

### Zero-Knowledge Architecture

**Core Principle**: Server never has access to unencrypted data or master password.

```
User Flow:
1. User enters Master Password (MP) → never sent to server
2. MP + Salt → PBKDF2/Argon2 → Master Key (MK)
3. MK splits into:
   - Authentication Key (sent to server for login)
   - Encryption Key (stays local, encrypts vault)
4. Server stores only:
   - Hashed Authentication Key
   - Encrypted vault blobs
   - User metadata (email, settings)
```

### Encryption Layers

#### Layer 1: Master Password Derivation
```javascript
// Client-side only
const salt = generateSalt(userId); // Unique per user
const iterations = 100000; // PBKDF2 iterations
const masterKey = pbkdf2(masterPassword, salt, iterations, 256);

// Split master key
const authKey = masterKey.slice(0, 128); // For authentication
const encryptionKey = masterKey.slice(128, 256); // For encryption
```

#### Layer 2: Vault Encryption
```javascript
// Each vault item encrypted individually
const itemKey = generateRandomKey(256); // Unique per item
const encryptedData = aes256gcm.encrypt(itemData, itemKey);
const encryptedItemKey = aes256gcm.encrypt(itemKey, encryptionKey);

// Stored format
{
  id: "item_uuid",
  encryptedData: "...", // AES-256-GCM encrypted
  encryptedKey: "...",  // Item key encrypted with master key
  iv: "...",            // Initialization vector
  authTag: "..."        // GCM authentication tag
}
```

#### Layer 3: Transport Security
- TLS 1.3 for all communications
- Certificate pinning in mobile apps
- HSTS headers
- CSP headers for web components

### Key Management

```
Master Password (MP) [User's brain]
     ↓
Master Key (MK) [Derived, never stored]
     ↓
     ├─→ Authentication Key → Server (hashed)
     └─→ Encryption Key → Encrypts:
            ├─→ Symmetric Vault Key
            └─→ Individual Item Keys
```

**Key Rotation Strategy:**
- Master password change: Re-encrypt all vault keys
- Item keys rotated on modification
- Server-side keys rotated quarterly
- Emergency key revocation procedure

---

## Database Schema

### User Table
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    auth_key_hash VARCHAR(512) NOT NULL, -- Hashed authentication key
    salt VARCHAR(128) NOT NULL,          -- For PBKDF2
    kdf_iterations INTEGER DEFAULT 100000,
    kdf_algorithm VARCHAR(32) DEFAULT 'PBKDF2',
    
    -- Self-hosting configuration
    custom_db_config JSONB,              -- User's DB connection (encrypted)
    is_self_hosted BOOLEAN DEFAULT FALSE,
    
    -- Account management
    email_verified BOOLEAN DEFAULT FALSE,
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    two_factor_secret VARCHAR(255),
    
    -- Metadata
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    last_login_at TIMESTAMP,
    
    -- Security
    failed_login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
```

### Vault Items Table
```sql
CREATE TABLE vault_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- Encrypted data
    encrypted_data TEXT NOT NULL,        -- JSON blob of all fields
    encrypted_key TEXT NOT NULL,         -- Item's symmetric key
    iv VARCHAR(64) NOT NULL,             -- Initialization vector
    auth_tag VARCHAR(64) NOT NULL,       -- GCM auth tag
    
    -- Metadata (unencrypted for searching/filtering)
    item_type VARCHAR(50) NOT NULL,      -- 'login', 'card', 'note'
    title_encrypted TEXT,                -- Encrypted title
    url_domain VARCHAR(255),             -- For auto-fill matching
    folder_id UUID,
    
    -- Sync management
    version INTEGER DEFAULT 1,
    last_modified_at TIMESTAMP DEFAULT NOW(),
    last_modified_by UUID,               -- Device/client ID
    deleted_at TIMESTAMP,                -- Soft delete
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_vault_items_user_id ON vault_items(user_id);
CREATE INDEX idx_vault_items_url_domain ON vault_items(url_domain);
CREATE INDEX idx_vault_items_deleted_at ON vault_items(deleted_at);
```

### Sync Metadata Table
```sql
CREATE TABLE sync_metadata (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    device_id UUID NOT NULL,
    device_name VARCHAR(255),
    device_type VARCHAR(50),             -- 'browser', 'ios', 'android', 'desktop'
    
    last_sync_at TIMESTAMP,
    last_sync_version INTEGER,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(user_id, device_id)
);
```

### Dynamic Fields Schema
```sql
CREATE TABLE field_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,          -- 'AWS Login', 'SSH Key'
    description TEXT,
    category VARCHAR(50),
    
    -- Template definition
    fields JSONB NOT NULL,
    /* Example:
    [
      {"name": "username", "type": "text", "required": true},
      {"name": "password", "type": "password", "required": true},
      {"name": "account_id", "type": "text", "required": true},
      {"name": "mfa_secret", "type": "secret", "required": false}
    ]
    */
    
    is_system_template BOOLEAN DEFAULT FALSE,
    user_id UUID REFERENCES users(id),   -- NULL for system templates
    
    created_at TIMESTAMP DEFAULT NOW()
);
```

---

## API Design

### Authentication Endpoints

```
POST /api/v1/auth/register
Request:
{
  "email": "user@example.com",
  "authKey": "hashed_auth_key",
  "salt": "random_salt",
  "kdfIterations": 100000,
  "kdfAlgorithm": "PBKDF2"
}

Response:
{
  "userId": "uuid",
  "token": "jwt_token",
  "refreshToken": "refresh_token"
}
```

```
POST /api/v1/auth/login
Request:
{
  "email": "user@example.com",
  "authKey": "hashed_auth_key",
  "deviceId": "device_uuid",
  "deviceName": "Chrome Extension"
}

Response:
{
  "token": "jwt_token",
  "refreshToken": "refresh_token",
  "syncVersion": 123,
  "lastSyncAt": "2025-01-10T10:00:00Z"
}
```

### Vault Management Endpoints

```
GET /api/v1/vault/items
Query Parameters:
  - since: timestamp (for delta sync)
  - limit: integer
  - offset: integer

Response:
{
  "items": [
    {
      "id": "uuid",
      "encryptedData": "...",
      "encryptedKey": "...",
      "iv": "...",
      "authTag": "...",
      "itemType": "login",
      "urlDomain": "example.com",
      "version": 1,
      "lastModifiedAt": "2025-01-10T10:00:00Z"
    }
  ],
  "syncVersion": 125,
  "hasMore": false
}
```

```
POST /api/v1/vault/items
Request:
{
  "encryptedData": "...",
  "encryptedKey": "...",
  "iv": "...",
  "authTag": "...",
  "itemType": "login",
  "urlDomain": "example.com"
}

Response:
{
  "id": "uuid",
  "version": 1,
  "syncVersion": 126
}
```

```
PUT /api/v1/vault/items/:id
Request:
{
  "encryptedData": "...",
  "version": 1,  // For optimistic locking
  ...
}

Response:
{
  "version": 2,
  "syncVersion": 127
}
```

### Sync Endpoints

```
POST /api/v1/sync/pull
Request:
{
  "lastSyncVersion": 120,
  "deviceId": "device_uuid"
}

Response:
{
  "items": [...],        // Changed items since version 120
  "deletedIds": [...],   // Deleted item IDs
  "currentVersion": 125,
  "conflicts": []        // Items with conflicts
}
```

```
POST /api/v1/sync/push
Request:
{
  "deviceId": "device_uuid",
  "changes": [
    {"action": "create", "item": {...}},
    {"action": "update", "item": {...}, "version": 1},
    {"action": "delete", "itemId": "uuid"}
  ]
}

Response:
{
  "syncVersion": 126,
  "conflicts": []
}
```

---

## Synchronization Strategy

### Conflict Resolution

**Last-Write-Wins with Version Tracking**

```javascript
function resolveConflict(localItem, remoteItem) {
  // Compare versions and timestamps
  if (localItem.version === remoteItem.version) {
    // Same version, use timestamp
    return localItem.lastModifiedAt > remoteItem.lastModifiedAt 
      ? localItem 
      : remoteItem;
  }
  
  // Higher version wins
  return localItem.version > remoteItem.version 
    ? localItem 
    : remoteItem;
}
```

**Alternative: Three-Way Merge**
- Keep server state
- Keep local state
- Merge both (if possible)
- User decides (present conflict UI)

### Offline-First Architecture

```javascript
// Client-side sync queue
class SyncQueue {
  async push(operation) {
    // Add to local queue
    await localDB.queue.add({
      operation,
      timestamp: Date.now(),
      retryCount: 0
    });
    
    // Try immediate sync
    this.syncNow();
  }
  
  async syncNow() {
    if (!navigator.onLine) return;
    
    const queue = await localDB.queue.getAll();
    const batch = queue.slice(0, 50); // Batch size
    
    try {
      const result = await api.sync.push(batch);
      await localDB.queue.removeMany(batch.map(b => b.id));
      await this.updateLocalState(result);
    } catch (error) {
      this.handleSyncError(error);
    }
  }
}
```

### Delta Sync

Only sync changed items since last sync:

```javascript
// Server-side delta calculation
async function getDeltaSince(userId, sinceVersion) {
  const changes = await db.query(`
    SELECT * FROM vault_items 
    WHERE user_id = $1 
      AND version > $2
    ORDER BY version ASC
  `, [userId, sinceVersion]);
  
  const deletions = await db.query(`
    SELECT id FROM vault_items 
    WHERE user_id = $1 
      AND deleted_at > (
        SELECT last_sync_at FROM sync_metadata 
        WHERE user_id = $1 AND last_sync_version = $2
      )
  `, [userId, sinceVersion]);
  
  return {
    changes,
    deletions,
    currentVersion: await getCurrentVersion(userId)
  };
}
```

---

## Self-Hosting Architecture

### Database Adapter Pattern

```javascript
// Abstract database interface
class DatabaseAdapter {
  async connect(config) { throw new Error('Not implemented'); }
  async createUser(userData) { throw new Error('Not implemented'); }
  async getVaultItems(userId) { throw new Error('Not implemented'); }
  async saveVaultItem(item) { throw new Error('Not implemented'); }
  // ... other methods
}

// PostgreSQL adapter
class PostgreSQLAdapter extends DatabaseAdapter {
  async connect(config) {
    this.pool = new Pool({
      host: config.host,
      port: config.port,
      database: config.database,
      user: config.user,
      password: config.password,
      ssl: config.ssl
    });
  }
  
  async createUser(userData) {
    const result = await this.pool.query(
      'INSERT INTO users (...) VALUES (...) RETURNING *',
      [...]
    );
    return result.rows[0];
  }
}

// MySQL adapter
class MySQLAdapter extends DatabaseAdapter {
  // MySQL-specific implementation
}

// MongoDB adapter
class MongoDBAdapter extends DatabaseAdapter {
  // MongoDB-specific implementation
}
```

### Self-Hosted Configuration Flow

```javascript
// Client stores encrypted DB config
const userDbConfig = {
  type: 'postgresql',
  host: 'user-db.example.com',
  port: 5432,
  database: 'passwords',
  user: 'pwmanager',
  password: 'encrypted_password',
  ssl: true
};

// Config is encrypted with user's encryption key
const encryptedConfig = encrypt(userDbConfig, userEncryptionKey);

// Stored in main DB, retrieved on server when needed
await mainDB.users.update(userId, {
  customDbConfig: encryptedConfig,
  isSelfHosted: true
});
```

### Docker Deployment

```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    image: password-manager-api:latest
    ports:
      - "3000:3000"
    environment:
      - DATABASE_TYPE=postgresql
      - DATABASE_HOST=db
      - DATABASE_PORT=5432
      - DATABASE_NAME=password_manager
      - JWT_SECRET=${JWT_SECRET}
      - ENCRYPTION_KEY=${ENCRYPTION_KEY}
    depends_on:
      - db
    volumes:
      - ./logs:/app/logs

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=password_manager
      - POSTGRES_USER=pwmanager
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    volumes:
      - pgdata:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
    ports:
      - "5432:5432"

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./certs:/etc/nginx/certs
    depends_on:
      - app

volumes:
  pgdata:
```

---

## Platform-Specific Considerations

### Browser Extension

**Manifest V3 Compatibility**
```json
{
  "manifest_version": 3,
  "permissions": [
    "storage",
    "activeTab",
    "webRequest"
  ],
  "host_permissions": [
    "https://api.yourservice.com/*"
  ],
  "background": {
    "service_worker": "background.js"
  },
  "content_scripts": [{
    "matches": ["<all_urls>"],
    "js": ["content.js"],
    "all_frames": true
  }]
}
```

**Auto-fill Detection**
```javascript
// Content script - detect login forms
function detectLoginForm() {
  const forms = document.querySelectorAll('form');
  
  for (const form of forms) {
    const passwordFields = form.querySelectorAll('input[type="password"]');
    const textFields = form.querySelectorAll('input[type="text"], input[type="email"]');
    
    if (passwordFields.length > 0 && textFields.length > 0) {
      return {
        form,
        usernameField: textFields[0],
        passwordField: passwordFields[0],
        additionalFields: extractAdditionalFields(form)
      };
    }
  }
}
```

### Mobile Apps (React Native)

**Biometric Authentication**
```javascript
import * as LocalAuthentication from 'expo-local-authentication';

async function authenticateWithBiometrics() {
  const hasHardware = await LocalAuthentication.hasHardwareAsync();
  const isEnrolled = await LocalAuthentication.isEnrolledAsync();
  
  if (hasHardware && isEnrolled) {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Unlock your vault',
      fallbackLabel: 'Use master password'
    });
    
    return result.success;
  }
  
  return false;
}
```

**iOS AutoFill Extension**
```swift
// AutoFill Credential Provider
class CredentialProviderViewController: ASCredentialProviderViewController {
    override func provideCredentialWithoutUserInteraction(
        for credentialIdentity: ASPasswordCredentialIdentity
    ) {
        // Quick unlock with biometrics
        // Fetch credential from encrypted storage
        // Return to system
    }
}
```

### Desktop Applications

**System Tray Integration**
```javascript
// Electron - main process
const { Tray, Menu } = require('electron');

function createTray() {
  const tray = new Tray('icon.png');
  
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Quick Search', click: showQuickSearch },
    { label: 'Generate Password', click: generatePassword },
    { type: 'separator' },
    { label: 'Lock Vault', click: lockVault },
    { label: 'Quit', click: quitApp }
  ]);
  
  tray.setContextMenu(contextMenu);
}
```

---

## Security Measures

### Rate Limiting
```javascript
const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: 'Too many login attempts, please try again later'
});

app.post('/api/v1/auth/login', loginLimiter, loginHandler);
```

### Input Validation
```javascript
const { body, validationResult } = require('express-validator');

app.post('/api/v1/vault/items',
  body('encryptedData').isString().notEmpty(),
  body('itemType').isIn(['login', 'card', 'note', 'identity']),
  body('urlDomain').optional().isURL(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    // ... handle request
  }
);
```

### Audit Logging
```sql
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50),
    resource_id UUID,
    ip_address INET,
    user_agent TEXT,
    success BOOLEAN,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);
```

---

## Scalability Considerations

### Horizontal Scaling
- Stateless API servers
- Session storage in Redis
- Database connection pooling
- CDN for static assets

### Caching Strategy
```javascript
// Redis caching for user data
const cache = require('redis').createClient();

async function getUserVaultItems(userId) {
  const cacheKey = `vault:${userId}`;
  const cached = await cache.get(cacheKey);
  
  if (cached) {
    return JSON.parse(cached);
  }
  
  const items = await db.getVaultItems(userId);
  await cache.setex(cacheKey, 300, JSON.stringify(items)); // 5 min TTL
  
  return items;
}
```

### Database Optimization
- Indexing on frequently queried fields
- Partitioning by user_id for large datasets
- Read replicas for sync operations
- Archive old audit logs

---

## Monitoring & Observability

### Health Checks
```javascript
app.get('/health', async (req, res) => {
  const checks = {
    database: await checkDatabase(),
    redis: await checkRedis(),
    diskSpace: await checkDiskSpace()
  };
  
  const healthy = Object.values(checks).every(c => c.status === 'ok');
  
  res.status(healthy ? 200 : 503).json(checks);
});
```

### Metrics to Track
- API response times
- Sync operation duration
- Failed login attempts
- Encryption/decryption performance
- Active users
- Storage usage per user

---

## Disaster Recovery

### Backup Strategy
1. Daily automated database backups
2. Point-in-time recovery capability
3. Encrypted backup storage
4. Regular restore testing
5. User export functionality

### Data Recovery
```javascript
// User-initiated backup export
app.get('/api/v1/export', authenticate, async (req, res) => {
  const items = await getVaultItems(req.user.id);
  
  // Items remain encrypted
  const backup = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    userId: req.user.id,
    items: items,
    checksum: calculateChecksum(items)
  };
  
  res.json(backup);
});
```

---

## Compliance & Privacy

### GDPR Compliance
- Right to access (export functionality)
- Right to deletion (account deletion flow)
- Data portability (standard export format)
- Privacy by design (zero-knowledge architecture)

### Data Retention
- Active vaults: Indefinite
- Deleted items: 30-day soft delete
- Audit logs: 1 year
- Deleted accounts: Immediate purge after confirmation

---

This architecture provides a solid foundation for building a secure, scalable, and user-controlled password management ecosystem. The zero-knowledge design ensures maximum security while the modular approach enables platform flexibility and self-hosting capabilities.
