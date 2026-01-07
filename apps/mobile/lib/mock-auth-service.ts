// Mock Authentication Service
// Simulates authentication using mock data for development without backend
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '@certplus/types';
import { mockUsers } from './mock-data';

// Mock passwords for all users (same password for simplicity in development)
const MOCK_PASSWORD = 'password123';

// Mock tokens (JWT-like but not real)
const generateMockToken = (userId: string): string => {
  return `mock_token_${userId}_${Date.now()}`;
};

const generateMockRefreshToken = (userId: string): string => {
  return `mock_refresh_${userId}_${Date.now()}`;
};

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData extends LoginCredentials {
  name: string;
  companyId?: string;
  role?: 'company' | 'employee' | 'viewer';
}

class MockAuthService {
  private token: string | null = null;
  private refreshToken: string | null = null;
  private currentUser: User | null = null;

  constructor() {
    this.loadStoredAuth();
  }

  // Load stored authentication from AsyncStorage
  private async loadStoredAuth() {
    try {
      const storedToken = await AsyncStorage.getItem('mockAuthToken');
      const storedRefreshToken = await AsyncStorage.getItem('mockRefreshToken');
      const storedUser = await AsyncStorage.getItem('mockCurrentUser');

      if (storedToken) this.token = storedToken;
      if (storedRefreshToken) this.refreshToken = storedRefreshToken;
      if (storedUser) this.currentUser = JSON.parse(storedUser);
    } catch (error) {
      console.error('Error loading stored mock auth:', error);
    }
  }

  // Save authentication to AsyncStorage
  private async saveAuth(token: string, refreshToken: string, user: User) {
    try {
      await AsyncStorage.setItem('mockAuthToken', token);
      await AsyncStorage.setItem('mockRefreshToken', refreshToken);
      await AsyncStorage.setItem('mockCurrentUser', JSON.stringify(user));

      this.token = token;
      this.refreshToken = refreshToken;
      this.currentUser = user;
    } catch (error) {
      console.error('Error saving mock auth:', error);
      throw new Error('Failed to save authentication');
    }
  }

  // Clear authentication from storage
  private async clearAuth() {
    try {
      await AsyncStorage.multiRemove(['mockAuthToken', 'mockRefreshToken', 'mockCurrentUser']);
      this.token = null;
      this.refreshToken = null;
      this.currentUser = null;
    } catch (error) {
      console.error('Error clearing mock auth:', error);
    }
  }

  // Simulate API delay for realistic experience
  private async simulateDelay(ms: number = 500): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Login user with mock data
  async login(credentials: LoginCredentials): Promise<User> {
    await this.simulateDelay();

    const { email, password } = credentials;

    // Find user by email
    const user = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      throw new Error('Credenziali non valide');
    }

    // Check if user is active
    if (user.isActive === false) {
      throw new Error('Account disattivato. Contatta l\'amministratore.');
    }

    // Validate password
    if (password !== MOCK_PASSWORD) {
      throw new Error('Credenziali non valide');
    }

    // Generate mock tokens
    const token = generateMockToken(user.id);
    const refreshToken = generateMockRefreshToken(user.id);

    // Save authentication
    await this.saveAuth(token, refreshToken, user);

    console.log('✅ Mock Login successful:', user.email);
    return user;
  }

  // Register new user (mock - just validates and returns existing user)
  async register(data: RegisterData): Promise<User> {
    await this.simulateDelay();

    const { email, password, name, companyId, role } = data;

    // Check if user already exists
    const existingUser = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (existingUser) {
      throw new Error('Email già registrata nel sistema');
    }

    // In mock mode, we can't actually create new users
    // Return error suggesting to use existing test accounts
    throw new Error(
      'Registrazione non disponibile in modalità mock. Usa uno degli account test esistenti.'
    );
  }

  // Logout user
  async logout(): Promise<void> {
    await this.simulateDelay(200);
    await this.clearAuth();
    console.log('✅ Mock Logout successful');
  }

  // Refresh access token
  async refreshAccessToken(): Promise<void> {
    if (!this.refreshToken || !this.currentUser) {
      throw new Error('No refresh token available');
    }

    await this.simulateDelay(300);

    // Generate new tokens
    const newToken = generateMockToken(this.currentUser.id);
    const newRefreshToken = generateMockRefreshToken(this.currentUser.id);

    this.token = newToken;
    this.refreshToken = newRefreshToken;

    await AsyncStorage.setItem('mockAuthToken', newToken);
    await AsyncStorage.setItem('mockRefreshToken', newRefreshToken);

    console.log('✅ Mock token refresh successful');
  }

  // Get current user
  async getCurrentUser(): Promise<User | null> {
    if (!this.token) return null;

    // Return cached user
    if (this.currentUser) {
      return this.currentUser;
    }

    // Try to load from storage
    try {
      const storedUser = await AsyncStorage.getItem('mockCurrentUser');
      if (storedUser) {
        this.currentUser = JSON.parse(storedUser);
        return this.currentUser;
      }
    } catch (error) {
      console.error('Error getting current mock user:', error);
    }

    return null;
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.token;
  }

  // Get current auth token
  getToken(): string | null {
    return this.token;
  }

  // Update user profile (mock - limited functionality)
  async updateProfile(updates: Partial<User>): Promise<User> {
    await this.simulateDelay();

    if (!this.currentUser) {
      throw new Error('No user authenticated');
    }

    // In mock mode, we can update limited fields
    const allowedUpdates: (keyof User)[] = ['name'];
    const filteredUpdates: Partial<User> = {};

    allowedUpdates.forEach(key => {
      if (updates[key] !== undefined) {
        filteredUpdates[key] = updates[key];
      }
    });

    const updatedUser: User = {
      ...this.currentUser,
      ...filteredUpdates,
      updatedAt: new Date().toISOString(),
    };

    // Save updated user
    this.currentUser = updatedUser;
    await AsyncStorage.setItem('mockCurrentUser', JSON.stringify(updatedUser));

    console.log('✅ Mock profile update successful');
    return updatedUser;
  }

  // Change password (mock - always succeeds if correct current password)
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await this.simulateDelay();

    if (currentPassword !== MOCK_PASSWORD) {
      throw new Error('Password corrente non corretta');
    }

    // In mock mode, we don't actually change passwords
    console.log('⚠️ Mock password change: passwords are not actually stored in mock mode');
  }

  // Request password reset (mock - always succeeds)
  async requestPasswordReset(email: string): Promise<void> {
    await this.simulateDelay();

    const user = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      // Don't reveal if email exists for security
      console.log('✅ Mock password reset email sent (simulated)');
      return;
    }

    console.log('✅ Mock password reset email sent to:', email);
  }

  // Reset password with token (mock)
  async resetPassword(token: string, newPassword: string): Promise<void> {
    await this.simulateDelay();

    // In mock mode, accept any token
    console.log('✅ Mock password reset successful');
  }
}

export const mockAuthService = new MockAuthService();

// Export mock test credentials for developer reference
export const MOCK_TEST_CREDENTIALS = {
  password: MOCK_PASSWORD,
  users: [
    {
      email: 'mario.rossi@segnaletica.it',
      name: 'Mario Rossi',
      role: 'company',
      company: 'Segnaletica Stradale SRL',
    },
    {
      email: 'giulia.ferrari@milanosafety.com',
      name: 'Giulia Ferrari',
      role: 'company',
      company: 'Milano Traffic Solutions SpA',
    },
    {
      email: 'giuseppe.verdi@segnaletica.it',
      name: 'Giuseppe Verdi',
      role: 'employee',
      company: 'Segnaletica Stradale SRL',
    },
    {
      email: 'luca.observer@demo.com',
      name: 'Luca Observer',
      role: 'viewer',
      company: 'N/A',
    },
  ],
};