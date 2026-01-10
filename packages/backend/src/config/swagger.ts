/**
 * Swagger/OpenAPI configuration
 */

import swaggerJsdoc from 'swagger-jsdoc';
import { config } from './index';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'iForgotPassword API',
      version: '1.0.0',
      description:
        'REST API for iForgotPassword - A secure, zero-knowledge password manager with self-hosting capabilities',
      contact: {
        name: 'API Support',
      },
      license: {
        name: 'TBD',
      },
    },
    servers: [
      {
        url: `http://localhost:${config.port}/api/v1`,
        description: 'Development server',
      },
      {
        url: 'https://api.iforgotpassword.com/api/v1',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token in the format: Bearer <token>',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            error: {
              type: 'object',
              properties: {
                message: {
                  type: 'string',
                  example: 'Error message',
                },
                statusCode: {
                  type: 'integer',
                  example: 400,
                },
                details: {
                  type: 'object',
                },
              },
            },
          },
        },
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              example: '123e4567-e89b-12d3-a456-426614174000',
            },
            email: {
              type: 'string',
              format: 'email',
              example: 'user@example.com',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        RegisterRequest: {
          type: 'object',
          required: ['email', 'authKey', 'salt', 'kdfIterations', 'kdfAlgorithm'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              example: 'user@example.com',
              description: 'User email address',
            },
            authKey: {
              type: 'string',
              example: 'base64_encoded_auth_key',
              description: 'Base64 encoded authentication key derived from master password',
            },
            salt: {
              type: 'string',
              example: 'base64_encoded_salt',
              description: 'Base64 encoded salt for PBKDF2',
            },
            kdfIterations: {
              type: 'integer',
              example: 100000,
              minimum: 100000,
              description: 'Number of PBKDF2 iterations (minimum 100,000)',
            },
            kdfAlgorithm: {
              type: 'string',
              enum: ['PBKDF2', 'Argon2'],
              example: 'PBKDF2',
              description: 'Key derivation function algorithm',
            },
          },
        },
        RegisterResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            data: {
              type: 'object',
              properties: {
                userId: {
                  type: 'string',
                  format: 'uuid',
                },
                token: {
                  type: 'string',
                  description: 'JWT access token',
                },
                refreshToken: {
                  type: 'string',
                  description: 'JWT refresh token',
                },
              },
            },
          },
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'authKey', 'deviceId', 'deviceName'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              example: 'user@example.com',
            },
            authKey: {
              type: 'string',
              example: 'base64_encoded_auth_key',
              description: 'Base64 encoded authentication key',
            },
            deviceId: {
              type: 'string',
              format: 'uuid',
              example: '123e4567-e89b-12d3-a456-426614174001',
              description: 'Unique device identifier',
            },
            deviceName: {
              type: 'string',
              example: 'Chrome Extension',
              description: 'Human-readable device name',
            },
          },
        },
        LoginResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            data: {
              type: 'object',
              properties: {
                token: {
                  type: 'string',
                  description: 'JWT access token',
                },
                refreshToken: {
                  type: 'string',
                  description: 'JWT refresh token',
                },
                syncVersion: {
                  type: 'integer',
                  example: 123,
                  description: 'Current sync version',
                },
                lastSyncAt: {
                  type: 'string',
                  format: 'date-time',
                  description: 'Last sync timestamp',
                },
              },
            },
          },
        },
        RefreshTokenRequest: {
          type: 'object',
          required: ['refreshToken'],
          properties: {
            refreshToken: {
              type: 'string',
              description: 'JWT refresh token',
            },
          },
        },
        RefreshTokenResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            data: {
              type: 'object',
              properties: {
                token: {
                  type: 'string',
                  description: 'New JWT access token',
                },
                refreshToken: {
                  type: 'string',
                  description: 'New JWT refresh token',
                },
              },
            },
          },
        },
        VaultItem: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            encryptedData: {
              type: 'string',
              description: 'Base64 encoded encrypted vault data',
            },
            encryptedKey: {
              type: 'string',
              description: 'Base64 encoded encrypted item key',
            },
            iv: {
              type: 'string',
              description: 'Base64 encoded initialization vector',
            },
            authTag: {
              type: 'string',
              description: 'Base64 encoded GCM authentication tag',
            },
            itemType: {
              type: 'string',
              enum: ['login', 'card', 'note', 'identity'],
              example: 'login',
            },
            urlDomain: {
              type: 'string',
              example: 'example.com',
              description: 'Domain for auto-fill matching (optional)',
            },
            version: {
              type: 'integer',
              example: 1,
              description: 'Item version for conflict resolution',
            },
            lastModifiedAt: {
              type: 'string',
              format: 'date-time',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        CreateVaultItemRequest: {
          type: 'object',
          required: ['encryptedData', 'encryptedKey', 'iv', 'authTag', 'itemType'],
          properties: {
            encryptedData: {
              type: 'string',
              description: 'Base64 encoded encrypted vault data',
            },
            encryptedKey: {
              type: 'string',
              description: 'Base64 encoded encrypted item key',
            },
            iv: {
              type: 'string',
              description: 'Base64 encoded initialization vector',
            },
            authTag: {
              type: 'string',
              description: 'Base64 encoded GCM authentication tag',
            },
            itemType: {
              type: 'string',
              enum: ['login', 'card', 'note', 'identity'],
            },
            urlDomain: {
              type: 'string',
              description: 'Domain for auto-fill matching (optional)',
            },
            deviceId: {
              type: 'string',
              format: 'uuid',
              description: 'Device that created this item',
            },
          },
        },
        UpdateVaultItemRequest: {
          type: 'object',
          required: ['encryptedData', 'encryptedKey', 'iv', 'authTag', 'version'],
          properties: {
            encryptedData: {
              type: 'string',
            },
            encryptedKey: {
              type: 'string',
            },
            iv: {
              type: 'string',
            },
            authTag: {
              type: 'string',
            },
            itemType: {
              type: 'string',
              enum: ['login', 'card', 'note', 'identity'],
            },
            urlDomain: {
              type: 'string',
            },
            version: {
              type: 'integer',
              description: 'Current version for optimistic locking',
            },
            deviceId: {
              type: 'string',
              format: 'uuid',
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
    tags: [
      {
        name: 'Authentication',
        description: 'User authentication and authorization endpoints',
      },
      {
        name: 'Vault',
        description: 'Encrypted vault management endpoints',
      },
      {
        name: 'Sync',
        description: 'Multi-device synchronization endpoints',
      },
      {
        name: 'Health',
        description: 'System health check',
      },
    ],
  },
  apis: ['./src/routes/*.ts'], // Path to the API routes
};

export const swaggerSpec = swaggerJsdoc(options);
