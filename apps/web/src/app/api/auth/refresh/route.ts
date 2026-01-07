/**
 * Auth Refresh API Route - Refresh JWT access token
 *
 * **Core Features:**
 * - POST: Generate new access token using refresh token
 * - Validate refresh token format and expiration
 * - Generate new access and refresh tokens
 * - Extend user session without re-login
 *
 * **Technical Architecture:**
 * - Next.js 15 App Router API routes
 * - TypeScript with full type safety
 * - JWT refresh token validation
 * - Token rotation for security
 *
 * **Request Body:**
 * - { refreshToken: string }
 *
 * **Response Format:**
 * - Success: { status_code: 200, payload: { data: { token, refreshToken } } }
 * - Error: { status_code: 4xx/5xx, message: string, payload: { data: null } }
 *
 * **Security:**
 * - Refresh tokens have longer expiration (7 days vs 24 hours for access tokens)
 * - Token rotation: New refresh token issued on each refresh
 */

import { NextRequest, NextResponse } from 'next/server';
import { mockUsers } from '@/lib/mock-data';
import { User } from '@certplus/types';

// POST /api/auth/refresh - Refresh access token
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate refresh token presence
    if (!body.refreshToken) {
      return NextResponse.json(
        {
          status_code: 400,
          message: 'Refresh token is required',
          payload: { data: null }
        },
        { status: 400 }
      );
    }

    // Decode and validate refresh token
    const tokenData = decodeRefreshToken(body.refreshToken);

    if (!tokenData) {
      return NextResponse.json(
        {
          status_code: 401,
          message: 'Invalid or expired refresh token',
          payload: { data: null }
        },
        { status: 401 }
      );
    }

    // Find user
    const user = mockUsers.find(u => u.id === tokenData.userId);

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

    // Generate new tokens (token rotation)
    const newToken = generateMockJWT(user);
    const newRefreshToken = generateMockRefreshToken(user);

    // Return new tokens
    return NextResponse.json({
      status_code: 200,
      message: 'Token refreshed successfully',
      payload: {
        data: {
          token: newToken,
          refreshToken: newRefreshToken,
        }
      }
    });

  } catch (error) {
    console.error('POST /api/auth/refresh error:', error);
    return NextResponse.json(
      {
        status_code: 500,
        message: 'Internal server error during token refresh',
        payload: { data: null }
      },
      { status: 500 }
    );
  }
}

// Helper: Decode and validate refresh token
function decodeRefreshToken(token: string): { userId: string; type: string; exp: number } | null {
  try {
    // Split JWT into parts
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    // Decode payload
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());

    // Validate it's a refresh token
    if (payload.type !== 'refresh') {
      console.log('Not a refresh token');
      return null;
    }

    // Check expiration
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      console.log('Refresh token expired');
      return null;
    }

    // Validate required fields
    if (!payload.userId) {
      return null;
    }

    return {
      userId: payload.userId,
      type: payload.type,
      exp: payload.exp,
    };

  } catch (error) {
    console.error('Refresh token decode error:', error);
    return null;
  }
}

// Helper: Generate mock JWT access token
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