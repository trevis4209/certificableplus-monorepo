/**
 * Auth Login API Route - User authentication endpoint
 *
 * **Core Features:**
 * - POST: Authenticate users with email/password
 * - Validate credentials against mock users
 * - Generate JWT access and refresh tokens
 * - Check user active status
 * - Return user data with tokens
 *
 * **Technical Architecture:**
 * - Next.js 15 App Router API routes
 * - TypeScript with full type safety
 * - Mock authentication (future: real password hashing with bcrypt)
 * - JWT token generation
 *
 * **Response Format:**
 * - Success: { status_code: 200, payload: { data: { user, token, refreshToken } } }
 * - Error: { status_code: 4xx/5xx, message: string, payload: { data: null } }
 *
 * **Mock Authentication:**
 * All users use password: "password123" (defined in mock-data.ts)
 */

import { NextRequest, NextResponse } from 'next/server';
import { mockUsers } from '@/lib/mock-data';
import { User } from '@certplus/types';

// Mock password for all users (in production, use bcrypt comparison)
const MOCK_PASSWORD = 'password123';

// POST /api/auth/login - Authenticate user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.email || !body.password) {
      return NextResponse.json(
        {
          status_code: 400,
          message: 'Email and password are required',
          payload: { data: null }
        },
        { status: 400 }
      );
    }

    // Find user by email
    const user = mockUsers.find(u => u.email.toLowerCase() === body.email.toLowerCase().trim());

    if (!user) {
      return NextResponse.json(
        {
          status_code: 401,
          message: 'Invalid email or password',
          payload: { data: null }
        },
        { status: 401 }
      );
    }

    // Validate password (mock implementation)
    // In production: await bcrypt.compare(body.password, user.passwordHash)
    if (body.password !== MOCK_PASSWORD) {
      return NextResponse.json(
        {
          status_code: 401,
          message: 'Invalid email or password',
          payload: { data: null }
        },
        { status: 401 }
      );
    }

    // Check if user is active
    if (!user.isActive) {
      return NextResponse.json(
        {
          status_code: 403,
          message: 'User account is inactive. Please contact support.',
          payload: { data: null }
        },
        { status: 403 }
      );
    }

    // Generate JWT tokens
    const token = generateMockJWT(user);
    const refreshToken = generateMockRefreshToken(user);

    // Update last login timestamp (in production, save to database)
    user.updatedAt = new Date().toISOString();

    // Return success response matching backend format
    return NextResponse.json({
      status_code: 200,
      message: 'Login successful',
      payload: {
        data: {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            companyId: user.companyId,
          },
          token,
          refreshToken,
        }
      }
    });

  } catch (error) {
    console.error('POST /api/auth/login error:', error);
    return NextResponse.json(
      {
        status_code: 500,
        message: 'Internal server error during login',
        payload: { data: null }
      },
      { status: 500 }
    );
  }
}

// Helper: Generate mock JWT token
function generateMockJWT(user: User): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64');
  const payload = Buffer.from(JSON.stringify({
    userId: user.id,
    email: user.email,
    role: user.role,
    companyId: user.companyId,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24), // 24 hours
  })).toString('base64');
  const signature = Buffer.from('mock-signature').toString('base64');
  return `${header}.${payload}.${signature}`;
}

// Helper: Generate mock refresh token
function generateMockRefreshToken(user: User): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64');
  const payload = Buffer.from(JSON.stringify({
    userId: user.id,
    type: 'refresh',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 7), // 7 days
  })).toString('base64');
  const signature = Buffer.from('mock-refresh-signature').toString('base64');
  return `${header}.${payload}.${signature}`;
}