import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth/middleware';
import { db } from '@/lib/database/postgres';

// GET /api/projects/check-code?code=ABC123&excludeId=xxx
export async function GET(request: NextRequest) {
  const user = await getAuthUser(request);
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const excludeId = searchParams.get('excludeId');

    if (!code) {
      return NextResponse.json({ error: 'Code is required' }, { status: 400 });
    }

    const isUnique = await db.isPublishCodeUnique(code, excludeId || undefined);
    
    return NextResponse.json({ isUnique });
  } catch (error) {
    console.error('Error checking code:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
