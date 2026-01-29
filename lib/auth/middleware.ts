import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth/jwt';
import { cookies } from 'next/headers';

export type AuthResult = {
  userId: string;
  email?: string;
} | null;

/**
 * Middleware helper to verify authentication
 * Returns the user payload if authenticated, null otherwise
 */
export async function getAuthUser(request?: NextRequest): Promise<AuthResult> {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('access_token')?.value;

    if (!accessToken) {
      return null;
    }

    const payload = await verifyToken(accessToken);
    return payload;
  } catch {
    return null;
  }
}

/**
 * Require authentication - returns 401 if not authenticated
 */
export async function requireAuth(request: NextRequest): Promise<AuthResult | NextResponse> {
  const user = await getAuthUser(request);
  
  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
  
  return user;
}
