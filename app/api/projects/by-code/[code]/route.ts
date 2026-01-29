import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database/postgres';

interface RouteParams {
  params: Promise<{ code: string }>;
}

// GET /api/projects/by-code/[code] - Get project by publish code (public access)
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { code } = await params;
    const project = await db.getPublishedProjectByCode(code);
    
    if (!project) {
      return NextResponse.json(
        { error: 'Display not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(project);
  } catch (error) {
    console.error('Error fetching project by code:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
