import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth/middleware';
import { unlink, readdir, stat } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

const STORAGE_PATH = process.env.STORAGE_PATH || './uploads';
const STORAGE_URL = process.env.STORAGE_URL || 'http://localhost:3000/uploads';

// DELETE /api/upload/[...path] - Delete a file
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const user = await getAuthUser(request);
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { path: pathParts } = await params;
    const relativePath = pathParts.join('/');

    // Security: Ensure user can only delete their own files
    if (!relativePath.startsWith(user.userId)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const filePath = path.join(STORAGE_PATH, relativePath);

    if (!existsSync(filePath)) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    await unlink(filePath);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
  }
}

// GET /api/upload/[...path] - List files or check if file exists
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const user = await getAuthUser(request);
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { path: pathParts } = await params;
    const relativePath = pathParts.join('/');

    // Security: Ensure user can only access their own files
    if (!relativePath.startsWith(user.userId)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const targetPath = path.join(STORAGE_PATH, relativePath);

    if (!existsSync(targetPath)) {
      return NextResponse.json({ error: 'Path not found' }, { status: 404 });
    }

    const stats = await stat(targetPath);

    if (stats.isDirectory()) {
      // List files in directory
      const files = await readdir(targetPath);
      const fileDetails = await Promise.all(
        files.map(async (file) => {
          const filePath = path.join(targetPath, file);
          const fileStats = await stat(filePath);
          return {
            name: file,
            path: `${relativePath}/${file}`,
            url: `${STORAGE_URL}/${relativePath}/${file}`,
            size: fileStats.size,
            isDirectory: fileStats.isDirectory(),
            modifiedAt: fileStats.mtime.toISOString(),
          };
        })
      );
      return NextResponse.json({ files: fileDetails });
    } else {
      // Return file info
      return NextResponse.json({
        exists: true,
        path: relativePath,
        url: `${STORAGE_URL}/${relativePath}`,
        size: stats.size,
        modifiedAt: stats.mtime.toISOString(),
      });
    }
  } catch (error) {
    console.error('List error:', error);
    return NextResponse.json({ error: 'Operation failed' }, { status: 500 });
  }
}
