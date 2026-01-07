/**
 * Auth Logout API Route - User logout endpoint
 *
 * **Core Features:**
 * - POST: Logout user and invalidate tokens (mock implementation)
 * - Validate Authorization header
 * - Clear server-side session data
 * - Return success confirmation
 *
 * **Technical Architecture:**
 * - Next.js 15 App Router API routes
 * - TypeScript with full type safety
 * - Token invalidation preparation
 * - Session cleanup
 *
 * **Authorization:**
 * - Header: Authorization: Bearer <token>
 * - Token validation before logout
 *
 * **Response Format:**
 * - Success: { status_code: 200, message: string, payload: { data: null } }
 * - Error: { status_code: 4xx/5xx, message: string, payload: { data: null } }
 *
 * **Note:**
 * In a real implementation, this would:
 * - Blacklist the token in Redis/database
 * - Clear HTTP-only refresh token cookie
 * - Log logout event for security audit
 * - Update user's last_activity timestamp
 */

import { NextRequest, NextResponse } from 'next/server';

// POST /api/auth/logout - Logout user
export async function POST(request: NextRequest) {
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
    const token = authHeader.substring(7);

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

    // Decode token to get user info (for logging)
    const tokenData = decodeJWT(token);

    if (!tokenData) {
      // Even if token is invalid, allow logout to proceed
      // This ensures users can always clear their client-side state
      return NextResponse.json({
        status_code: 200,
        message: 'Logout successful',
        payload: { data: null }
      });
    }

    // In a real implementation, perform these actions:
    // 1. Add token to blacklist in Redis with TTL = token.exp
    // 2. Clear refresh token from HTTP-only cookie
    // 3. Log logout event with userId, timestamp, IP address
    // 4. Update user's last_activity in database
    // 5. Optionally: Invalidate all user sessions if requested

    console.log(`User ${tokenData.userId} (${tokenData.email}) logged out`);

    // Return success response
    return NextResponse.json({
      status_code: 200,
      message: 'Logout successful. Please clear local tokens.',
      payload: { data: null }
    });

  } catch (error) {
    console.error('POST /api/auth/logout error:', error);
    // Even on error, return success to allow client-side cleanup
    return NextResponse.json({
      status_code: 200,
      message: 'Logout completed',
      payload: { data: null }
    });
  }
}

// Helper: Decode JWT token
function decodeJWT(token: string): { userId: string; email: string; role: string; exp: number } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());

    if (!payload.userId || !payload.email) {
      return null;
    }

    return {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
      exp: payload.exp,
    };

  } catch (error) {
    console.error('JWT decode error:', error);
    return null;
  }
}