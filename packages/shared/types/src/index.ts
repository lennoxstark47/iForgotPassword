/**
 * Shared Types Library
 *
 * TypeScript type definitions used across the iForgotPassword ecosystem.
 */

// Export user types
export type {
  User,
  RegisterRequest,
  RegisterResponse,
  LoginRequest,
  LoginResponse,
  TokenPayload,
  RefreshTokenRequest,
  RefreshTokenResponse,
} from './user';

// Export vault types
export type {
  VaultItemType,
  VaultItem,
  LoginCredential,
  CardCredential,
  NoteCredential,
  IdentityCredential,
  CustomField,
  Folder,
  CreateVaultItemRequest,
  CreateVaultItemResponse,
  UpdateVaultItemRequest,
  UpdateVaultItemResponse,
  GetVaultItemsResponse,
} from './vault';

// Export sync types
export type {
  DeviceType,
  SyncMetadata,
  SyncAction,
  SyncChange,
  SyncPullRequest,
  SyncPullResponse,
  SyncPushRequest,
  SyncPushResponse,
  SyncConflict,
  ConflictResolution,
  ResolvedConflict,
} from './sync';

// Export API types
export type {
  ApiError,
  ApiResponse,
  PaginationParams,
  PaginationMeta,
  PaginatedResponse,
} from './api';
