/**
 * Auth Me API Route - Get current authenticated user
 *
 * **Core Features:**
 * - GET: Retrieve current user data from JWT token
 * - Validate Authorization header (Bearer token)
 * - Decode JWT and extract user information
 * - Return user profile data
 *
 * **Technical Architecture:**
 * - Next.js 15 App Router API routes
 * - TypeScript with full type safety
 * - JWT token validation
 * - Protected route requiring authentication
 *
 * **Authorization:**
 * - Header: Authorization: Bearer <token>
 * - Token must be valid JWT from login/register
 *
 * **Response Format:**
 * - Success: { status_code: 200, payload: { data: { user } } }
 * - Error: { status_code: 4xx/5xx, message: string, payload: { data: null } }
 */

import { NextRequest, NextResponse } from 'next/server';
import { mockUsers } from '@/lib/mock-data';

// GET /api/auth/me - Get current authenticated user
export async function GET(request: NextRequest) {
  try {
    // Extract Authorization header
    const authHeader = request.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        {
          status_code: 401,
          message: 'Missing or invalid Authorization header',
          payload: { data: null }
        },
        { status: 401 }
      );
    }

    // Extract token
    const token = authHeader.substring(7); // Remove "Bearer " prefix

    if (!token) {
      return NextResponse.json(
        {
          status_code: 401,
          message: 'Token not provided',
          payload: { data: null }
        },
        { status: 401 }
      );
    }

    // Decode JWT token (mock implementation)
    const userData = decodeJWT(token);

    if (!userData) {
      return NextResponse.json(
        {
          status_code: 401,
          message: 'Invalid or expired token',
          payload: { data: null }
        },
        { status: 401 }
      );
    }

    // Find user in mock data
    const user = mockUsers.find(u => u.id === userData.userId);

    if (!user) {
      return NextResponse.json(
        {
          status_code: 404,
          message: 'User not found',
          payload: { data: null }
        },
        { status: 404 }
      );
    }

    // Check if user is still active
    if (!user.isActive) {
      return NextResponse.json(
        {
          status_code: 403,
          message: 'User account is inactive',
          payload: { data: null }
        },
        { status: 403 }
      );
    }

    // Return user data (exclude sensitive information)
    return NextResponse.json({
      status_code: 200,
      message: 'User retrieved successfully',
      payload: {
        data: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          companyId: user.companyId,
          isActive: user.isActive,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        }
      }
    });

  } catch (error) {
    console.error('GET /api/auth/me error:', error);
    return NextResponse.json(
      {
        status_code: 500,
        message: 'Internal server error',
        payload: { data: null }
      },
      { status: 500 }
    );
  }
}

// Helper: Decode mock JWT token
function decodeJWT(token: string): { userId: string; email: string; role: string; companyId: string; exp: number } | null {
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
      exp: payload.exp,
    };

  } catch (error) {
    console.error('JWT decode error:', error);
    return null;
  }
}