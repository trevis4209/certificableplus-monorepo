// Authentication Service for MySQL Backend
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '@certplus/types';
import { mockAuthService } from './mock-auth-service';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
const USE_MOCK_AUTH = process.env.EXPO_PUBLIC_USE_MOCK_AUTH === 'true';

interface AuthResponse {
  status_code: number;
  message: string;
  payload: {
    data: {
      user: User;
      token: string;
      refreshToken?: string;
    };
  };
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData extends LoginCredentials {
  name: string;
  companyId?: string;
  role?: 'company' | 'employee' | 'viewer';
}

class AuthService {
  private token: string | null = null;
  private refreshToken: string | null = null;
  private currentUser: User | null = null;

  constructor() {
    this.loadStoredAuth();
  }

  // Load stored authentication from AsyncStorage
  private async loadStoredAuth() {
    try {
      const storedToken = await AsyncStorage.getItem('authToken');
      const storedRefreshToken = await AsyncStorage.getItem('refreshToken');
      const storedUser = await AsyncStorage.getItem('currentUser');

      if (storedToken) this.token = storedToken;
      if (storedRefreshToken) this.refreshToken = storedRefreshToken;
      if (storedUser) this.currentUser = JSON.parse(storedUser);
    } catch (error) {
      console.error('Error loading stored auth:', error);
    }
  }

  // Save authentication to AsyncStorage
  private async saveAuth(token: string, refreshToken: string | undefined, user: User) {
    try {
      await AsyncStorage.setItem('authToken', token);
      if (refreshToken) {
        await AsyncStorage.setItem('refreshToken', refreshToken);
      }
      await AsyncStorage.setItem('currentUser', JSON.stringify(user));

      this.token = token;
      this.refreshToken = refreshToken || null;
      this.currentUser = user;
    } catch (error) {
      console.error('Error saving auth:', error);
    }
  }

  // Clear authentication from storage
  private async clearAuth() {
    try {
      await AsyncStorage.multiRemove(['authToken', 'refreshToken', 'currentUser']);
      this.token = null;
      this.refreshToken = null;
      this.currentUser = null;
    } catch (error) {
      console.error('Error clearing auth:', error);
    }
  }

  // Make authenticated API request
  private async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Add authorization header if token exists
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    // Merge with any existing headers from options
    if (options?.headers) {
      Object.assign(headers, options.headers);
    }

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle token expiration
        if (response.status === 401 && this.refreshToken) {
          await this.refreshAccessToken();
          // Retry the request with new token
          return this.request(endpoint, options);
        }
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error);
      throw error;
    }
  }

  // Login user
  async login(credentials: LoginCredentials): Promise<User> {
    // Use mock authentication if enabled
    if (USE_MOCK_AUTH) {
      console.log('🎭 Using MOCK authentication mode');
      return mockAuthService.login(credentials);
    }

    try {
      const response = await this.request<AuthResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });

      const { user, token, refreshToken } = response.payload.data;
      await this.saveAuth(token, refreshToken, user);

      return user;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  // Register new user
  async register(data: RegisterData): Promise<User> {
    // Use mock authentication if enabled
    if (USE_MOCK_AUTH) {
      console.log('🎭 Using MOCK authentication mode');
      return mockAuthService.register(data);
    }

    try {
      const response = await this.request<AuthResponse>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      });

      const { user, token, refreshToken } = response.payload.data;
      await this.saveAuth(token, refreshToken, user);

      return user;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  // Logout user
  async logout(): Promise<void> {
    // Use mock authentication if enabled
    if (USE_MOCK_AUTH) {
      console.log('🎭 Using MOCK authentication mode');
      return mockAuthService.logout();
    }

    try {
      // Call logout endpoint if available
      if (this.token) {
        await this.request('/auth/logout', {
          method: 'POST',
        }).catch(err => console.log('Logout endpoint error:', err));
      }
    } finally {
      // Always clear local auth
      await this.clearAuth();
    }
  }

  // Refresh access token
  async refreshAccessToken(): Promise<void> {
    if (!this.refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await this.request<AuthResponse>('/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({ refreshToken: this.refreshToken }),
      });

      const { token, refreshToken } = response.payload.data;

      if (token) {
        this.token = token;
        await AsyncStorage.setItem('authToken', token);
      }

      if (refreshToken) {
        this.refreshToken = refreshToken;
        await AsyncStorage.setItem('refreshToken', refreshToken);
      }
    } catch (error) {
      console.error('Token refresh error:', error);
      await this.clearAuth();
      throw error;
    }
  }

  // Get current user
  async getCurrentUser(): Promise<User | null> {
    // Use mock authentication if enabled
    if (USE_MOCK_AUTH) {
      return mockAuthService.getCurrentUser();
    }

    if (!this.token) return null;

    try {
      // If user is cached, return it
      if (this.currentUser) {
        return this.currentUser;
      }

      // Otherwise fetch from API
      const response = await this.request<{ payload: { data: User } }>('/auth/me', {
        method: 'GET',
      });

      this.currentUser = response.payload.data;
      await AsyncStorage.setItem('currentUser', JSON.stringify(this.currentUser));

      return this.currentUser;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    if (USE_MOCK_AUTH) {
      return mockAuthService.isAuthenticated();
    }
    return !!this.token;
  }

  // Get current auth token
  getToken(): string | null {
    if (USE_MOCK_AUTH) {
      return mockAuthService.getToken();
    }
    return this.token;
  }

  // Update user profile
  async updateProfile(updates: Partial<User>): Promise<User> {
    try {
      const response = await this.request<{ payload: { data: User } }>('/auth/profile', {
        method: 'PATCH',
        body: JSON.stringify(updates),
      });

      this.currentUser = response.payload.data;
      await AsyncStorage.setItem('currentUser', JSON.stringify(this.currentUser));

      return this.currentUser;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  }

  // Change password
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    try {
      await this.request('/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });
    } catch (error) {
      console.error('Change password error:', error);
      throw error;
    }
  }

  // Request password reset
  async requestPasswordReset(email: string): Promise<void> {
    try {
      await this.request('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
    } catch (error) {
      console.error('Password reset request error:', error);
      throw error;
    }
  }

  // Reset password with token
  async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      await this.request('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({
          token,
          newPassword,
        }),
      });
    } catch (error) {
      console.error('Password reset error:', error);
      throw error;
    }
  }
}

export const authService = new AuthService();