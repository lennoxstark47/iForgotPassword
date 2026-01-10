# Instructions for Claude - Development Assistant Guide

## Purpose of This Document

This document provides instructions for Claude (AI assistant) to help you build the password manager ecosystem efficiently. It outlines how Claude should assist at each phase, what code to generate, what questions to ask, and how to maintain consistency throughout the project.

---

## General Instructions for Claude

### Core Principles
1. **Security First**: Always prioritize security in code suggestions, never compromise on encryption or authentication
2. **Zero-Knowledge Architecture**: Ensure no plaintext passwords or sensitive data ever reach the server
3. **Code Quality**: Generate production-ready code with proper error handling, logging, and documentation
4. **Cross-Platform Consistency**: Maintain consistent patterns across browser, mobile, and desktop platforms
5. **Self-Hosting Friendly**: Keep database operations abstracted for easy adapter implementation

### Communication Style
- Ask clarifying questions before generating complex code
- Explain security implications of implementation choices
- Provide alternatives when trade-offs exist
- Reference the planning and architecture documents
- Suggest testing strategies for each component

---

## Phase 1: Backend & Browser Extension

### Phase 1.1: Backend Setup (Month 1)

#### When User Asks: "Help me set up the Node.js backend"

**Claude Should:**
1. **Generate Project Structure**
   ```
   /backend
     /src
       /config
       /controllers
       /middleware
       /models
       /routes
       /services
       /utils
       /database
     /tests
     package.json
     .env.example
     docker-compose.yml
   ```

2. **Ask Critical Questions:**
   - "What hosting platform are you planning to use? (AWS, GCP, Azure, self-hosted)"
   - "Do you want to start with PostgreSQL or add MySQL/MongoDB support immediately?"
   - "Should I include Docker configuration for local development?"
   - "What version of Node.js are you targeting? (Recommend 18 LTS or 20 LTS)"

3. **Generate Core Files:**
   - `package.json` with essential dependencies
   - Database connection with pooling
   - JWT authentication middleware
   - Basic Express server setup
   - Environment configuration
   - Migration system setup

4. **Provide Security Checklist:**
   - [ ] HTTPS/TLS configuration
   - [ ] CORS properly configured
   - [ ] Rate limiting on auth endpoints
   - [ ] SQL injection prevention (parameterized queries)
   - [ ] XSS prevention (helmet.js)
   - [ ] Secrets in environment variables

#### When User Asks: "Implement the encryption system"

**Claude Should:**
1. **Explain the Zero-Knowledge Flow:**
   - Draw ASCII diagram of key derivation
   - Explain why master password never reaches server
   - Clarify difference between auth key and encryption key

2. **Generate Crypto Utilities:**
   ```javascript
   // utils/crypto.js
   - deriveKeys(masterPassword, salt)
   - encryptVaultItem(data, key)
   - decryptVaultItem(encryptedData, key)
   - generateSalt()
   - generateItemKey()
   ```

3. **Security Warnings:**
   - "Never log encryption keys"
   - "Use crypto.timingSafeEqual for key comparison"
   - "Ensure IV is unique for each encryption"
   - "Implement proper key rotation mechanism"

4. **Ask About Key Derivation:**
   - "PBKDF2 or Argon2? (Argon2 is more secure but requires native dependencies)"
   - "How many iterations for PBKDF2? (Recommend 100,000 minimum)"

#### When User Asks: "Create the database schema"

**Claude Should:**
1. **Generate Migration Files:**
   - Use Knex.js or similar migration tool
   - Create incremental migration files
   - Include rollback scripts

2. **Provide SQL with Indexes:**
   - Include all tables from architecture doc
   - Add proper indexes for performance
   - Include foreign key constraints
   - Add CHECK constraints for data validation

3. **Ask About Database:**
   - "Should I create a seed file for development?"
   - "Do you want soft delete or hard delete for vault items?"
   - "Should audit logs be in the same database or separate?"

### Phase 1.2: Browser Extension (Month 2)

#### When User Asks: "Help me build the browser extension structure"

**Claude Should:**
1. **Generate Extension Structure:**
   ```
   /extension
     /src
       /background
       /content
       /popup
       /options
       /utils
     /public
       /icons
       manifest.json
     webpack.config.js
   ```

2. **Create Manifest.json:**
   - Manifest V3 format
   - Minimal permissions requested
   - Content security policy
   - Host permissions for API

3. **Ask Key Questions:**
   - "Should I use React for the popup UI or vanilla JavaScript?"
   - "Which browsers to support initially? (Chrome, Firefox, Edge)"
   - "Do you want to use a build tool like Webpack or Vite?"

4. **Generate Core Components:**
   - Background service worker
   - Content script for form detection
   - Popup UI with vault list
   - Local storage wrapper (IndexedDB)

#### When User Asks: "Implement auto-fill functionality"

**Claude Should:**
1. **Generate Form Detection Logic:**
   ```javascript
   // Detect login forms
   // Extract form fields
   // Match with stored credentials
   // Inject credentials securely
   ```

2. **Security Considerations:**
   - "Never inject into cross-origin iframes"
   - "Validate URL matches before auto-fill"
   - "Implement user confirmation for ambiguous matches"
   - "Clear clipboard after password copy"

3. **Ask About UX:**
   - "Should auto-fill be automatic or require user click?"
   - "How to handle multiple matching credentials?"
   - "Should we support custom field mapping?"

### Phase 1.3: Sync Implementation (Month 3)

#### When User Asks: "Implement synchronization"

**Claude Should:**
1. **Generate Sync Service:**
   ```javascript
   class SyncService {
     async pullChanges(lastSyncVersion)
     async pushChanges(localChanges)
     async resolveConflicts(conflicts)
     async queueOfflineChange(change)
   }
   ```

2. **Explain Conflict Resolution:**
   - Show algorithm for last-write-wins
   - Provide alternative three-way merge
   - Suggest user intervention for critical conflicts

3. **Ask About Strategy:**
   - "Background sync or manual sync?"
   - "How to handle large vaults (1000+ items)?"
   - "Should we batch sync operations?"
   - "Sync interval for automatic sync?"

4. **Generate Offline Queue:**
   - IndexedDB queue for offline changes
   - Retry mechanism with exponential backoff
   - Conflict detection and resolution

---

## Phase 2: Mobile Apps (React Native)

### Phase 2.1: React Native Setup (Month 4)

#### When User Asks: "Set up React Native project"

**Claude Should:**
1. **Generate Project with Expo or React Native CLI:**
   - Ask: "Expo or bare React Native? (Expo for faster development)"
   - Create folder structure
   - Set up navigation
   - Configure environment variables

2. **Set Up State Management:**
   - Ask: "Redux Toolkit or Zustand? (Zustand is lighter)"
   - Create store structure
   - Generate action creators
   - Set up persistence

3. **Install Security Libraries:**
   ```json
   {
     "react-native-keychain": "^8.0.0",
     "react-native-biometrics": "^3.0.0",
     "expo-crypto": "^12.0.0",
     "react-native-aes-crypto": "^2.0.0"
   }
   ```

#### When User Asks: "Implement biometric authentication"

**Claude Should:**
1. **Generate Biometric Module:**
   ```javascript
   // services/biometrics.js
   - checkBiometricAvailability()
   - authenticateWithBiometrics()
   - storeBiometricSecret()
   - retrieveBiometricSecret()
   ```

2. **Platform-Specific Code:**
   - iOS: Face ID / Touch ID implementation
   - Android: Fingerprint / Face unlock
   - Fallback to PIN/password

3. **Security Best Practices:**
   - "Store encryption key in secure enclave/keystore"
   - "Never store master password, only derived key"
   - "Implement biometric timeout/re-authentication"

### Phase 2.2: Auto-fill Implementation (Month 5-6)

#### When User Asks: "Add iOS AutoFill extension"

**Claude Should:**
1. **Explain iOS AutoFill:**
   - How Credential Provider Extension works
   - Shared data container between app and extension
   - Limitations and capabilities

2. **Generate Extension Code:**
   - Swift code for Credential Provider
   - React Native bridge if needed
   - Shared encrypted storage

3. **Ask About Implementation:**
   - "Native Swift or React Native with native modules?"
   - "Should we support QuickType bar suggestions?"

#### When User Asks: "Add Android Autofill Service"

**Claude Should:**
1. **Generate Autofill Service:**
   - Kotlin/Java autofill service
   - Parse AutofillRequest
   - Match credentials
   - Create FillResponse

2. **Create React Native Bridge:**
   - Native module for autofill
   - JavaScript interface
   - Event communication

---

## Phase 3: Desktop Applications

### Phase 3.1: Electron Setup (Month 8-9)

#### When User Asks: "Create Electron desktop app"

**Claude Should:**
1. **Ask Architecture Question:**
   - "Electron (cross-platform) or native (better performance)?"
   - "Shared React codebase with web or separate UI?"

2. **Generate Electron Structure:**
   ```
   /desktop
     /main       (main process)
     /renderer   (renderer process)
     /preload
     /native     (native modules)
   ```

3. **Create Main Process:**
   - Window management
   - System tray integration
   - Global shortcuts
   - Auto-updater

4. **Security Configuration:**
   - Context isolation enabled
   - Node integration disabled in renderer
   - Secure IPC communication
   - CSP headers

#### When User Asks: "Implement system-wide auto-fill"

**Claude Should:**
1. **Platform-Specific Approaches:**
   - **Windows**: Ask "Using Windows Credential Manager API or custom implementation?"
   - **macOS**: Ask "Using Accessibility API or Input Method Kit?"

2. **Generate Native Modules:**
   - C++ addon for Windows
   - Swift/Objective-C for macOS
   - Node.js bindings

3. **Warn About Permissions:**
   - Accessibility permissions required
   - Security implications
   - User education needed

---

## Phase 4: Self-Hosting Features

### When User Asks: "Add self-hosting capability"

**Claude Should:**
1. **Generate Database Adapter Interface:**
   ```javascript
   class DatabaseAdapter {
     // Abstract methods
     connect(config)
     disconnect()
     createUser(userData)
     getVaultItems(userId)
     // ... all database operations
   }
   ```

2. **Create Specific Adapters:**
   - PostgreSQLAdapter
   - MySQLAdapter
   - MongoDBAdapter

3. **Ask About Configuration:**
   - "How should users provide DB credentials? (UI form, config file, env vars)"
   - "Should we validate DB connection before saving?"
   - "Support for connection string or individual parameters?"

4. **Generate Docker Setup:**
   - `docker-compose.yml`
   - Environment variable template
   - nginx reverse proxy config
   - SSL certificate setup with Let's Encrypt

5. **Create Setup Documentation:**
   - Step-by-step guide
   - Prerequisites
   - Troubleshooting section
   - Security hardening checklist

---

## Code Generation Guidelines for Claude

### Always Include in Generated Code

1. **Error Handling:**
   ```javascript
   try {
     // Operation
   } catch (error) {
     logger.error('Operation failed', { error, context });
     throw new CustomError('User-friendly message', error);
   }
   ```

2. **Input Validation:**
   ```javascript
   if (!isValid(input)) {
     throw new ValidationError('Invalid input');
   }
   ```

3. **Logging:**
   ```javascript
   logger.info('Operation started', { userId, operation });
   // ... operation
   logger.info('Operation completed', { userId, duration });
   ```

4. **TypeScript Types (if using TypeScript):**
   ```typescript
   interface VaultItem {
     id: string;
     encryptedData: string;
     encryptedKey: string;
     // ...
   }
   ```

5. **Comments:**
   ```javascript
   /**
    * Encrypts vault item with AES-256-GCM
    * @param {Object} data - Plain data object
    * @param {Buffer} key - 256-bit encryption key
    * @returns {Object} Encrypted data with IV and auth tag
    */
   ```

### Never Include in Generated Code

1. Hardcoded secrets or API keys
2. Console.log in production code (use logger)
3. Commented-out code (explain alternatives instead)
4. TODO comments without GitHub issue reference
5. Insecure crypto implementations (crypto.randomBytes, not Math.random)

---

## Testing Instructions for Claude

### When User Asks: "Help me write tests for X"

**Claude Should:**
1. **Ask About Testing Framework:**
   - "Jest, Mocha, or another framework?"
   - "Do you want integration tests or just unit tests?"

2. **Generate Test Structure:**
   ```javascript
   describe('VaultService', () => {
     describe('encryptItem', () => {
       it('should encrypt data correctly', () => {});
       it('should generate unique IV', () => {});
       it('should throw on invalid key', () => {});
     });
   });
   ```

3. **Include Test Data:**
   - Mock users
   - Mock vault items
   - Test credentials (clearly marked as test-only)

4. **Security Test Cases:**
   - SQL injection attempts
   - XSS payloads
   - Authentication bypass attempts
   - Rate limiting verification

---

## Debugging Assistance Instructions

### When User Reports: "X is not working"

**Claude Should:**
1. **Ask Diagnostic Questions:**
   - "What error message do you see?"
   - "Can you share relevant logs?"
   - "What were you trying to do?"
   - "What environment (dev/staging/prod)?"

2. **Provide Debugging Steps:**
   - Step-by-step diagnostic process
   - Logging statements to add
   - Network inspection tips
   - Database query verification

3. **Common Issues Checklist:**
   - Environment variables set correctly?
   - Database migrations run?
   - Correct API endpoint configuration?
   - CORS headers set?
   - Encryption keys match?

---

## Deployment Assistance Instructions

### When User Asks: "Help me deploy X"

**Claude Should:**
1. **Ask About Environment:**
   - Target platform (AWS, GCP, Azure, VPS)
   - Budget constraints
   - Expected scale
   - Backup requirements

2. **Generate Deployment Scripts:**
   - CI/CD pipeline (GitHub Actions, GitLab CI)
   - Docker deployment
   - Database migration scripts
   - Health check endpoints

3. **Create Deployment Checklist:**
   - [ ] Environment variables set
   - [ ] SSL certificates configured
   - [ ] Database backed up
   - [ ] Monitoring enabled
   - [ ] Rollback plan ready

4. **Security Hardening:**
   - Firewall rules
   - Rate limiting
   - DDoS protection
   - Intrusion detection

---

## Performance Optimization Instructions

### When User Asks: "How do I optimize X?"

**Claude Should:**
1. **Identify Bottlenecks:**
   - Database queries
   - API response times
   - Memory usage
   - Client-side rendering

2. **Suggest Optimizations:**
   - Database indexing
   - Query optimization
   - Caching strategies
   - Code splitting

3. **Generate Benchmarks:**
   - Performance test scripts
   - Load testing configuration
   - Metrics to track

---

## Documentation Instructions

### When User Asks: "Help me document X"

**Claude Should:**
1. **Generate Documentation:**
   - API documentation (OpenAPI/Swagger)
   - User guide
   - Developer setup guide
   - Architecture diagrams (ASCII/Mermaid)

2. **Include Examples:**
   - Code snippets
   - cURL commands
   - Screenshots (describe what to capture)

3. **Keep Updated:**
   - Suggest doc-as-code approach
   - Generate from code comments
   - Version documentation

---

## Maintenance Instructions

### When User Asks: "How do I maintain X?"

**Claude Should:**
1. **Create Maintenance Schedule:**
   - Daily: Log review
   - Weekly: Security updates
   - Monthly: Performance review
   - Quarterly: Dependency updates

2. **Generate Monitoring Scripts:**
   - Health checks
   - Alert configurations
   - Dashboard setup

3. **Backup Procedures:**
   - Automated backup scripts
   - Recovery testing
   - Retention policies

---

## Claude's Response Template

When assisting with code generation, Claude should follow this template:

```markdown
## [Feature/Component Name]

### Context
[Brief explanation of what this does and why]

### Security Considerations
[Any security implications or best practices]

### Implementation

[Code here]

### Testing
[How to test this component]

### Next Steps
[What to do after implementing this]

### Questions
1. [Clarifying question if needed]
2. [Another question if needed]
```

---

## Emergency Response Instructions

### When User Reports: "Security breach!" or "Data leak!"

**Claude Should:**
1. **Stay Calm, Provide Immediate Actions:**
   - "Immediately revoke all active tokens"
   - "Disable API access temporarily"
   - "Check audit logs for unauthorized access"

2. **Generate Incident Response Checklist:**
   - [ ] Identify scope of breach
   - [ ] Preserve evidence (logs)
   - [ ] Notify affected users
   - [ ] Patch vulnerability
   - [ ] Post-mortem analysis

3. **Never Blame:**
   - Focus on solution, not fault
   - Provide constructive guidance
   - Learn from incident

---

## Final Reminders for Claude

1. **Always prioritize security** over convenience
2. **Ask questions** before making assumptions
3. **Provide context** for code suggestions
4. **Reference documentation** when available
5. **Suggest testing** for every feature
6. **Think cross-platform** consistency
7. **Consider self-hosting** implications
8. **Maintain zero-knowledge** architecture
9. **Document everything** you generate
10. **Be helpful and encouraging** throughout the journey

---

## Success Metrics for Claude's Assistance

Claude should aim for:
- ✅ 100% of generated code compiles/runs
- ✅ Security best practices always followed
- ✅ Clear explanations for complex concepts
- ✅ Proactive error prevention suggestions
- ✅ Consistent code style across project
- ✅ Complete documentation for features
- ✅ Helpful debugging when issues arise

---

This document should be treated as a living guide. As the project evolves, update these instructions to reflect new patterns, decisions, and best practices discovered during development.
