/**
 * API Service
 * Handles all communication with the backend API
 */

import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
} from '@iforgotpassword/shared-types';
import { sessionStorage } from '../storage/sessionStorage';
import { localStorage } from '../storage/localStorage';

class ApiService {
  private baseUrl: string = 'http://localhost:3000';

  async init() {
    const settings = await localStorage.getSettings();
    this.baseUrl = settings.apiBaseUrl;
  }

  /**
   * Register a new user
   */
  async register(data: RegisterRequest): Promise<RegisterResponse> {
    const response = await fetch(`${this.baseUrl}/api/v1/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Registration failed');
    }

    return response.json();
  }

  /**
   * Login user
   */
  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await fetch(`${this.baseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Login failed');
    }

    const result = await response.json();

    // Store tokens in session storage
    await sessionStorage.setTokens(result.accessToken, result.refreshToken);

    return result;
  }

  /**
   * Refresh access token
   */
  async refreshToken(): Promise<RefreshTokenResponse> {
    const refreshToken = await sessionStorage.getRefreshToken();

    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await fetch(`${this.baseUrl}/api/v1/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken } as RefreshTokenRequest),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Token refresh failed');
    }

    const result = await response.json();

    // Update access token
    await sessionStorage.setAccessToken(result.accessToken);

    return result;
  }

  /**
   * Make an authenticated request
   */
  private async authenticatedRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const accessToken = await sessionStorage.getAccessToken();

    if (!accessToken) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        ...options.headers,
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    });

    // If token expired, try to refresh and retry
    if (response.status === 401) {
      try {
        await this.refreshToken();

        // Retry the request with new token
        const newToken = await sessionStorage.getAccessToken();
        const retryResponse = await fetch(`${this.baseUrl}${endpoint}`, {
          ...options,
          headers: {
            ...options.headers,
            'Content-Type': 'application/json',
            Authorization: `Bearer ${newToken}`,
          },
        });

        if (!retryResponse.ok) {
          const error = await retryResponse.json();
          throw new Error(error.message || 'Request failed');
        }

        return retryResponse.json();
      } catch (error) {
        // Refresh failed, user needs to login again
        throw new Error('Session expired. Please login again.');
      }
    }

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Request failed');
    }

    return response.json();
  }

  /**
   * Get all vault items
   */
  async getVaultItems(lastSyncVersion?: number) {
    const endpoint = lastSyncVersion
      ? `/api/v1/vault/items?lastSyncVersion=${lastSyncVersion}`
      : '/api/v1/vault/items';

    return this.authenticatedRequest(endpoint);
  }

  /**
   * Create vault item
   */
  async createVaultItem(data: any) {
    return this.authenticatedRequest('/api/v1/vault/items', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Update vault item
   */
  async updateVaultItem(id: string, data: any) {
    return this.authenticatedRequest(`/api/v1/vault/items/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * Delete vault item
   */
  async deleteVaultItem(id: string) {
    return this.authenticatedRequest(`/api/v1/vault/items/${id}`, {
      method: 'DELETE',
    });
  }

  /**
   * Pull changes from server
   */
  async syncPull(deviceId: string, lastSyncVersion: number) {
    return this.authenticatedRequest('/api/v1/sync/pull', {
      method: 'POST',
      body: JSON.stringify({ deviceId, lastSyncVersion }),
    });
  }

  /**
   * Push changes to server
   */
  async syncPush(deviceId: string, changes: any[]) {
    return this.authenticatedRequest('/api/v1/sync/push', {
      method: 'POST',
      body: JSON.stringify({ deviceId, changes }),
    });
  }
}

// Export singleton instance
export const apiService = new ApiService();
