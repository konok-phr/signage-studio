/**
 * Storage Abstraction Layer
 * 
 * Exports the appropriate storage adapter based on environment configuration.
 * This allows the application to switch between Supabase Storage, local filesystem,
 * or S3-compatible storage without changing any application code.
 * 
 * Usage:
 *   import { storage } from '@/lib/storage';
 *   const { url, error } = await storage.uploadFile(file, path);
 */

import { config } from '@/lib/config';
import { supabaseStorageAdapter } from './supabase-adapter';
import type { StorageAdapter } from './types';

// Export types
export * from './types';

// Placeholder for local storage adapter (for Next.js/self-hosted)
// This would be implemented when migrating to Next.js with API routes
const localStorageAdapter: StorageAdapter = {
  async uploadFile() {
    throw new Error('Local storage adapter requires Next.js API routes. Set STORAGE_PROVIDER=supabase or migrate to Next.js.');
  },
  getPublicUrl() {
    throw new Error('Local storage adapter requires Next.js API routes.');
  },
  async deleteFile() {
    throw new Error('Local storage adapter requires Next.js API routes.');
  },
  async listFiles() {
    throw new Error('Local storage adapter requires Next.js API routes.');
  },
  async fileExists() {
    throw new Error('Local storage adapter requires Next.js API routes.');
  },
};

// Placeholder for S3 storage adapter
const s3StorageAdapter: StorageAdapter = {
  async uploadFile() {
    throw new Error('S3 storage adapter requires Next.js API routes. Set STORAGE_PROVIDER=supabase or migrate to Next.js.');
  },
  getPublicUrl() {
    throw new Error('S3 storage adapter requires Next.js API routes.');
  },
  async deleteFile() {
    throw new Error('S3 storage adapter requires Next.js API routes.');
  },
  async listFiles() {
    throw new Error('S3 storage adapter requires Next.js API routes.');
  },
  async fileExists() {
    throw new Error('S3 storage adapter requires Next.js API routes.');
  },
};

// Select adapter based on configuration
const getAdapter = (): StorageAdapter => {
  switch (config.storage.provider) {
    case 'supabase':
      return supabaseStorageAdapter;
    case 'local':
      return localStorageAdapter;
    case 's3':
      return s3StorageAdapter;
    default:
      console.warn(`Unknown storage provider: ${config.storage.provider}, falling back to Supabase`);
      return supabaseStorageAdapter;
  }
};

// Export the configured storage adapter
export const storage: StorageAdapter = getAdapter();

// Re-export individual adapters for direct access if needed
export { supabaseStorageAdapter } from './supabase-adapter';

export default storage;
