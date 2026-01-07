/**
 * Client-Side Authentication Utilities
 *
 * **Purpose**: Manage authentication state in browser localStorage
 *
 * **Core Features:**
 * - Retrieve current authenticated user from localStorage
 * - Retrieve JWT authentication token
 * - Check authentication status
 * - Clear authentication data on logout
 *
 * **Usage:**
 * ```typescript
 * import { getCurrentUser, getAuthToken, isAuthenticated } from '@/lib/auth-client';
 *
 * // In Client Components
 * const user = getCurrentUser();
 * const token = getAuthToken();
 * const isLoggedIn = isAuthenticated();
 * ```
 *
 * **Important**: These functions only work in browser environment (Client Components)
 */

import { User } from '@certplus/types';

/**
 * Get current authenticated user from localStorage
 * @returns User object or null if not authenticated
 */
export function getCurrentUser(): User | null {
  // Check if running in browser
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const userJson = localStorage.getItem('currentUser');

    if (!userJson) {
      return null;
    }

    const user = JSON.parse(userJson) as User;

    // Validate user object has required fields
    if (!user.id || !user.email || !user.role) {
      console.warn('Invalid user object in localStorage');
      return null;
    }

    return user;
  } catch (error) {
    console.error('Failed to parse currentUser from localStorage:', error);
    return null;
  }
}

/**
 * Get JWT authentication token from localStorage
 * @returns JWT token string or null if not found
 */
export function getAuthToken(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    return localStorage.getItem('authToken');
  } catch (error) {
    console.error('Failed to retrieve authToken from localStorage:', error);
    return null;
  }
}

/**
 * Get refresh token from localStorage
 * @returns Refresh token string or null if not found
 */
export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    return localStorage.getItem('refreshToken');
  } catch (error) {
    console.error('Failed to retrieve refreshToken from localStorage:', error);
    return null;
  }
}

/**
 * Check if user is currently authenticated
 * @returns true if user has valid authentication data
 */
export function isAuthenticated(): boolean {
  const user = getCurrentUser();
  const token = getAuthToken();

  return !!(user && token);
}

/**
 * Clear all authentication data from localStorage
 * Used on logout
 */
export function clearAuth(): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('currentUser');

    console.log('✅ Authentication data cleared from localStorage');
  } catch (error) {
    console.error('Failed to clear authentication data:', error);
  }
}

/**
 * Save user and tokens to localStorage
 * Used after successful login
 *
 * @param user - User object from login response
 * @param token - JWT access token
 * @param refreshToken - JWT refresh token
 */
export function saveAuth(user: User, token: string, refreshToken?: string): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.setItem('currentUser', JSON.stringify(user));
    localStorage.setItem('authToken', token);

    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken);
    }

    console.log('✅ Authentication data saved to localStorage');
  } catch (error) {
    console.error('Failed to save authentication data:', error);
  }
}

/**
 * Update user data in localStorage
 * Used when user profile is updated
 *
 * @param user - Updated user object
 */
export function updateCurrentUser(user: User): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.setItem('currentUser', JSON.stringify(user));
    console.log('✅ User data updated in localStorage');
  } catch (error) {
    console.error('Failed to update user data:', error);
  }
}

/**
 * Check if user has specific role
 * @param allowedRoles - Array of roles to check against
 * @returns true if user has one of the allowed roles
 */
export function hasRole(allowedRoles: Array<'company' | 'employee' | 'viewer'>): boolean {
  const user = getCurrentUser();

  if (!user) {
    return false;
  }

  return allowedRoles.includes(user.role as any);
}

/**
 * Get user's company ID
 * @returns Company ID or null if not available
 */
export function getUserCompanyId(): string | null {
  const user = getCurrentUser();
  return user?.companyId || null;
}