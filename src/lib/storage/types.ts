/**
 * Storage abstraction types
 * 
 * These types define the interface for file storage operations,
 * allowing different implementations (Supabase Storage, Local FS, S3, etc.)
 */

// Upload result
export interface UploadResult {
  url: string | null;
  path: string | null;
  error: Error | null;
}

// File metadata
export interface FileMetadata {
  name: string;
  size: number;
  mimeType: string;
  createdAt: string;
  path: string;
  publicUrl: string;
}

// List result
export interface ListResult {
  files: FileMetadata[];
  error: Error | null;
}

// Delete result
export interface DeleteResult {
  error: Error | null;
}

// Storage adapter interface
export interface StorageAdapter {
  // Upload a file
  uploadFile(
    file: File,
    path: string,
    options?: {
      cacheControl?: string;
      upsert?: boolean;
    }
  ): Promise<UploadResult>;

  // Get public URL for a file
  getPublicUrl(path: string): string;

  // Delete a file
  deleteFile(path: string): Promise<DeleteResult>;

  // List files in a directory
  listFiles(prefix: string): Promise<ListResult>;

  // Check if file exists
  fileExists(path: string): Promise<boolean>;
}
