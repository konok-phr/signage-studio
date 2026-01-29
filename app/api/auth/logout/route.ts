import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database/postgres';
import { cookies } from 'next/headers';

// POST /api/auth/logout
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get('refresh_token')?.value;

    // Invalidate session in database
    if (refreshToken) {
      await db.deleteSession(refreshToken);
    }

    // Clear cookies
    cookieStore.delete('access_token');
    cookieStore.delete('refresh_token');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
