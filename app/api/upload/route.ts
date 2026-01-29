import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth/middleware';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const STORAGE_PATH = process.env.STORAGE_PATH || './uploads';
const STORAGE_URL = process.env.STORAGE_URL || 'http://localhost:3000/uploads';
const MAX_FILE_SIZE = parseInt(process.env.STORAGE_MAX_FILE_SIZE || '104857600', 10); // 100MB

// Allowed file types
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];
const ALLOWED_AUDIO_TYPES = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp4'];
const ALLOWED_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES, ...ALLOWED_AUDIO_TYPES];

function getFileExtension(mimeType: string): string {
  const extensions: Record<string, string> = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/gif': '.gif',
    'image/webp': '.webp',
    'image/svg+xml': '.svg',
    'video/mp4': '.mp4',
    'video/webm': '.webm',
    'video/ogg': '.ogv',
    'video/quicktime': '.mov',
    'audio/mpeg': '.mp3',
    'audio/wav': '.wav',
    'audio/ogg': '.ogg',
    'audio/mp4': '.m4a',
  };
  return extensions[mimeType] || '';
}

function getMediaType(mimeType: string): 'images' | 'videos' | 'audio' {
  if (ALLOWED_IMAGE_TYPES.includes(mimeType)) return 'images';
  if (ALLOWED_VIDEO_TYPES.includes(mimeType)) return 'videos';
  return 'audio';
}

// POST /api/upload - Upload a file
export async function POST(request: NextRequest) {
  const user = await getAuthUser(request);
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: `File type not allowed. Allowed types: ${ALLOWED_TYPES.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File too large. Maximum size: ${MAX_FILE_SIZE / (1024 * 1024)}MB` },
        { status: 400 }
      );
    }

    // Generate file path
    const mediaType = getMediaType(file.type);
    const extension = getFileExtension(file.type);
    const fileName = `${uuidv4()}${extension}`;
    const userDir = path.join(STORAGE_PATH, user.userId, mediaType);
    const filePath = path.join(userDir, fileName);

    // Ensure directory exists
    if (!existsSync(userDir)) {
      await mkdir(userDir, { recursive: true });
    }

    // Write file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Generate public URL
    const publicUrl = `${STORAGE_URL}/${user.userId}/${mediaType}/${fileName}`;

    return NextResponse.json({
      url: publicUrl,
      path: `${user.userId}/${mediaType}/${fileName}`,
      size: file.size,
      type: file.type,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
