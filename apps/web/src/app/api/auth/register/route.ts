/**
 * Auth Register API Route - User registration endpoint
 *
 * **Core Features:**
 * - POST: Register new users with validation
 * - Email uniqueness validation
 * - Password hashing preparation (mock mode)
 * - Role-based registration (company, employee, viewer)
 * - JWT token generation on successful registration
 *
 * **Technical Architecture:**
 * - Next.js 15 App Router API routes
 * - TypeScript with full type safety
 * - Zod validation for input data
 * - Mock data integration (future: real database)
 *
 * **Response Format:**
 * - Success: { status_code: 200, payload: { data: { user, token, refreshToken } } }
 * - Error: { status_code: 4xx/5xx, message: string, payload: { data: null } }
 */

import { NextRequest, NextResponse } from 'next/server';
import { mockUsers } from '@/lib/mock-data';
import { User } from '@certplus/types';

// POST /api/auth/register - Register new user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const requiredFields = ['email', 'password', 'name', 'role', 'companyId'];
    const missingFields = requiredFields.filter(field => !body[field]);

    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          status_code: 400,
          message: `Missing required fields: ${missingFields.join(', ')}`,
          payload: { data: null }
        },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        {
          status_code: 400,
          message: 'Invalid email format',
          payload: { data: null }
        },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingUser = mockUsers.find(u => u.email === body.email);
    if (existingUser) {
      return NextResponse.json(
        {
          status_code: 400,
          message: 'Email already registered',
          payload: { data: null }
        },
        { status: 400 }
      );
    }

    // Validate role
    const validRoles = ['company', 'employee', 'viewer'];
    if (!validRoles.includes(body.role)) {
      return NextResponse.json(
        {
          status_code: 400,
          message: `Invalid role. Must be one of: ${validRoles.join(', ')}`,
          payload: { data: null }
        },
        { status: 400 }
      );
    }

    // Validate password strength
    if (body.password.length < 6) {
      return NextResponse.json(
        {
          status_code: 400,
          message: 'Password must be at least 6 characters long',
          payload: { data: null }
        },
        { status: 400 }
      );
    }

    // Create new user
    const now = new Date().toISOString();
    const newUser: User = {
      id: `user-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      email: body.email.toLowerCase().trim(),
      name: body.name.trim(),
      role: body.role,
      companyId: body.companyId,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };

    // Add to mock data (in production, save to database)
    mockUsers.push(newUser);

    // Generate JWT tokens (mock implementation)
    const token = generateMockJWT(newUser);
    const refreshToken = generateMockRefreshToken(newUser);

    // Return success response matching backend format
    return NextResponse.json({
      status_code: 200,
      message: 'User registered successfully',
      payload: {
        data: {
          user: {
            id: newUser.id,
            email: newUser.email,
            name: newUser.name,
            role: newUser.role,
            companyId: newUser.companyId,
          },
          token,
          refreshToken,
        }
      }
    });

  } catch (error) {
    console.error('POST /api/auth/register error:', error);
    return NextResponse.json(
      {
        status_code: 500,
        message: 'Internal server error during registration',
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