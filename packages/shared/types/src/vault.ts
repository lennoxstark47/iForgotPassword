/**
 * Vault and credential types
 */

/**
 * Vault item types
 */
export type VaultItemType = 'login' | 'card' | 'note' | 'identity';

/**
 * Base vault item (stored in database)
 */
export interface VaultItem {
  id: string;
  userId: string;

  // Encrypted data
  encryptedData: string; // JSON blob of all fields
  encryptedKey: string; // Item's symmetric key
  iv: string; // Initialization vector
  authTag: string; // GCM auth tag

  // Metadata (unencrypted for searching/filtering)
  itemType: VaultItemType;
  titleEncrypted?: string; // Encrypted title
  urlDomain?: string; // For auto-fill matching
  folderId?: string;

  // Sync management
  version: number;
  lastModifiedAt: Date;
  lastModifiedBy: string; // Device/client ID
  deletedAt?: Date; // Soft delete

  createdAt: Date;
  updatedAt: Date;
}

/**
 * Decrypted login credentials
 */
export interface LoginCredential {
  id?: string;
  title: string;
  username: string;
  password: string;
  url?: string;
  notes?: string;
  customFields?: CustomField[];
  folderId?: string;
}

/**
 * Decrypted credit card
 */
export interface CardCredential {
  id?: string;
  title: string;
  cardholderName: string;
  cardNumber: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
  notes?: string;
  folderId?: string;
}

/**
 * Decrypted secure note
 */
export interface NoteCredential {
  id?: string;
  title: string;
  content: string;
  folderId?: string;
}

/**
 * Decrypted identity
 */
export interface IdentityCredential {
  id?: string;
  title: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  notes?: string;
  folderId?: string;
}

/**
 * Custom field for extensibility
 */
export interface CustomField {
  name: string;
  value: string;
  type: 'text' | 'password' | 'email' | 'url';
  hidden?: boolean;
}

/**
 * Folder for organizing vault items
 */
export interface Folder {
  id: string;
  userId: string;
  name: string;
  parentId?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Create vault item request
 */
export interface CreateVaultItemRequest {
  encryptedData: string;
  encryptedKey: string;
  iv: string;
  authTag: string;
  itemType: VaultItemType;
  urlDomain?: string;
  folderId?: string;
}

/**
 * Create vault item response
 */
export interface CreateVaultItemResponse {
  id: string;
  version: number;
  syncVersion: number;
}

/**
 * Update vault item request
 */
export interface UpdateVaultItemRequest {
  encryptedData: string;
  encryptedKey: string;
  iv: string;
  authTag: string;
  version: number; // For optimistic locking
  urlDomain?: string;
  folderId?: string;
}

/**
 * Update vault item response
 */
export interface UpdateVaultItemResponse {
  version: number;
  syncVersion: number;
}

/**
 * Get vault items response
 */
export interface GetVaultItemsResponse {
  items: VaultItem[];
  syncVersion: number;
  hasMore: boolean;
}
