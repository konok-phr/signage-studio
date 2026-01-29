import { NextRequest, NextResponse } from 'next/server';
import { verifyRefreshToken, createToken, createRefreshToken } from '@/lib/auth/jwt';
import { db } from '@/lib/database/postgres';
import { cookies } from 'next/headers';

// POST /api/auth/refresh - Refresh access token
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get('refresh_token')?.value;

    if (!refreshToken) {
      return NextResponse.json(
        { error: 'No refresh token' },
        { status: 401 }
      );
    }

    // Verify refresh token
    const payload = await verifyRefreshToken(refreshToken);
    if (!payload) {
      cookieStore.delete('access_token');
      cookieStore.delete('refresh_token');
      return NextResponse.json(
        { error: 'Invalid refresh token' },
        { status: 401 }
      );
    }

    // Check if session exists
    const session = await db.getSessionByToken(refreshToken);
    if (!session) {
      cookieStore.delete('access_token');
      cookieStore.delete('refresh_token');
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 401 }
      );
    }

    // Get user
    const user = await db.getUserById(payload.userId);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 401 }
      );
    }

    // Create new tokens
    const newAccessToken = await createToken({ userId: user.id, email: user.email });
    const newRefreshToken = await createRefreshToken({ userId: user.id });

    // Update session with new refresh token
    await db.deleteSession(refreshToken);
    await db.createSession(user.id, newRefreshToken);

    // Set new cookies
    cookieStore.set('access_token', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 1 day
      path: '/',
    });
    cookieStore.set('refresh_token', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    });

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        created_at: user.created_at,
      },
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
