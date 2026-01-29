/**
 * Supabase Storage Adapter
 * 
 * Implements StorageAdapter interface using Supabase Storage
 */

import { supabase } from '@/integrations/supabase/client';
import type { 
  StorageAdapter, 
  UploadResult, 
  DeleteResult, 
  ListResult,
  FileMetadata 
} from './types';

const BUCKET_NAME = 'signage-media';

export const supabaseStorageAdapter: StorageAdapter = {
  async uploadFile(
    file: File,
    path: string,
    options?: { cacheControl?: string; upsert?: boolean }
  ): Promise<UploadResult> {
    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(path, file, {
        cacheControl: options?.cacheControl || '3600',
        upsert: options?.upsert || false,
      });

    if (uploadError) {
      return { url: null, path: null, error: new Error(uploadError.message) };
    }

    const { data: { publicUrl } } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(path);

    return {
      url: publicUrl,
      path,
      error: null,
    };
  },

  getPublicUrl(path: string): string {
    const { data: { publicUrl } } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(path);
    
    return publicUrl;
  },

  async deleteFile(path: string): Promise<DeleteResult> {
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([path]);

    if (error) {
      return { error: new Error(error.message) };
    }

    return { error: null };
  },

  async listFiles(prefix: string): Promise<ListResult> {
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .list(prefix);

    if (error) {
      return { files: [], error: new Error(error.message) };
    }

    const files: FileMetadata[] = (data || []).map((file) => ({
      name: file.name,
      size: file.metadata?.size || 0,
      mimeType: file.metadata?.mimetype || 'application/octet-stream',
      createdAt: file.created_at,
      path: `${prefix}/${file.name}`,
      publicUrl: this.getPublicUrl(`${prefix}/${file.name}`),
    }));

    return { files, error: null };
  },

  async fileExists(path: string): Promise<boolean> {
    const parts = path.split('/');
    const fileName = parts.pop() || '';
    const prefix = parts.join('/');

    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .list(prefix, {
        search: fileName,
      });

    if (error) return false;
    
    return (data || []).some((file) => file.name === fileName);
  },
};

export default supabaseStorageAdapter;
