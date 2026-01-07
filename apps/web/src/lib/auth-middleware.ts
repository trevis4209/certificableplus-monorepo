/**
 * Authentication Middleware - JWT token validation utilities
 *
 * **Core Features:**
 * - JWT token validation and decoding
 * - Authorization header extraction
 * - User authentication verification
 * - Role-based access control preparation
 *
 * **Usage in API Routes:**
 * ```typescript
 * import { validateAuthToken, requireAuth } from '@/lib/auth-middleware';
 *
 * export async function GET(request: NextRequest) {
 *   const user = await requireAuth(request);
 *   if (!user.success) {
 *     return user.error; // Returns NextResponse with error
 *   }
 *   // Use user.data for authenticated user
 * }
 * ```
 *
 * **Technical Architecture:**
 * - Pure utility functions for reusability
 * - TypeScript with full type safety
 * - NextResponse integration
 * - Mock JWT validation (production: use jsonwebtoken library)
 */

import { NextRequest, NextResponse } from 'next/server';
import { mockUsers } from '@/lib/mock-data';
import { User } from '@certplus/types';

/**
 * JWT Token Payload Interface
 */
export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  companyId: string;
  iat: number;
  exp: number;
}

/**
 * Authentication Result Type
 */
export type AuthResult<T> =
  | { success: true; data: T }
  | { success: false; error: NextResponse };

/**
 * Extract Bearer token from Authorization header
 */
export function extractBearerToken(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  return authHeader.substring(7); // Remove "Bearer " prefix
}

/**
 * Decode and validate JWT token
 */
export function decodeJWT(token: string): TokenPayload | null {
  try {
    // Split JWT into parts
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    // Decode payload (second part)
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());

    // Check expiration
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      console.log('Token expired');
      return null;
    }

    // Validate required fields
    if (!payload.userId || !payload.email || !payload.role) {
      return null;
    }

    return {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
      companyId: payload.companyId,
      iat: payload.iat,
      exp: payload.exp,
    };

  } catch (error) {
    console.error('JWT decode error:', error);
    return null;
  }
}

/**
 * Validate authentication token and return token payload
 */
export function validateAuthToken(request: NextRequest): AuthResult<TokenPayload> {
  // Extract token
  const token = extractBearerToken(request);

  if (!token) {
    return {
      success: false,
      error: NextResponse.json(
        {
          status_code: 401,
          message: 'Missing or invalid Authorization header',
          payload: { data: null }
        },
        { status: 401 }
      )
    };
  }

  // Decode and validate token
  const tokenData = decodeJWT(token);

  if (!tokenData) {
    return {
      success: false,
      error: NextResponse.json(
        {
          status_code: 401,
          message: 'Invalid or expired token',
          payload: { data: null }
        },
        { status: 401 }
      )
    };
  }

  return {
    success: true,
    data: tokenData
  };
}

/**
 * Require authentication and return full user object
 */
export async function requireAuth(request: NextRequest): Promise<AuthResult<User>> {
  // Validate token
  const tokenResult = validateAuthToken(request);

  if (!tokenResult.success) {
    return tokenResult as AuthResult<User>;
  }

  // Find user in mock data
  const user = mockUsers.find(u => u.id === tokenResult.data.userId);

  if (!user) {
    return {
      success: false,
      error: NextResponse.json(
        {
          status_code: 404,
          message: 'User not found',
          payload: { data: null }
        },
        { status: 404 }
      )
    };
  }

  // Check if user is active
  if (!user.isActive) {
    return {
      success: false,
      error: NextResponse.json(
        {
          status_code: 403,
          message: 'User account is inactive',
          payload: { data: null }
        },
        { status: 403 }
      )
    };
  }

  return {
    success: true,
    data: user
  };
}

/**
 * Require specific role(s) for access
 */
export async function requireRole(
  request: NextRequest,
  allowedRoles: Array<'company' | 'employee' | 'viewer'>
): Promise<AuthResult<User>> {
  // First check authentication
  const authResult = await requireAuth(request);

  if (!authResult.success) {
    return authResult;
  }

  // Check role permission
  if (!allowedRoles.includes(authResult.data.role as any)) {
    return {
      success: false,
      error: NextResponse.json(
        {
          status_code: 403,
          message: `Access denied. Required roles: ${allowedRoles.join(', ')}`,
          payload: { data: null }
        },
        { status: 403 }
      )
    };
  }

  return authResult;
}

/**
 * Require company ownership for resource access
 */
export async function requireCompanyAccess(
  request: NextRequest,
  resourceCompanyId: string
): Promise<AuthResult<User>> {
  // First check authentication
  const authResult = await requireAuth(request);

  if (!authResult.success) {
    return authResult;
  }

  const user = authResult.data;

  // Company users can only access their own company's resources
  // Viewers have no restrictions (can view any company)
  if (user.role === 'company' || user.role === 'employee') {
    if (user.companyId !== resourceCompanyId) {
      return {
        success: false,
        error: NextResponse.json(
          {
            status_code: 403,
            message: 'Access denied. You can only access your company\'s resources.',
            payload: { data: null }
          },
          { status: 403 }
        )
      };
    }
  }

  return authResult;
}

/**
 * Optional authentication - returns user if authenticated, null if not
 */
export async function optionalAuth(request: NextRequest): Promise<User | null> {
  const token = extractBearerToken(request);

  if (!token) {
    return null;
  }

  const tokenData = decodeJWT(token);

  if (!tokenData) {
    return null;
  }

  const user = mockUsers.find(u => u.id === tokenData.userId);

  return user && user.isActive ? user : null;
}