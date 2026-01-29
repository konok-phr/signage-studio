import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database/postgres';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/projects/published/[id] - Get published project (public access)
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const project = await db.getPublishedProjectById(id);
    
    if (!project) {
      return NextResponse.json(
        { error: 'Display not found or not published' },
        { status: 404 }
      );
    }

    return NextResponse.json(project);
  } catch (error) {
    console.error('Error fetching published project:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
