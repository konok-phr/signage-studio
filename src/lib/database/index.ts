/**
 * Database Abstraction Layer
 * 
 * Exports the appropriate database adapter based on environment configuration.
 * This allows the application to switch between Supabase and local PostgreSQL
 * without changing any application code.
 * 
 * Usage:
 *   import { db } from '@/lib/database';
 *   const { data, error } = await db.getProjectsByUser(userId);
 */

import { config } from '@/lib/config';
import { supabaseAdapter } from './supabase-adapter';
import type { DatabaseAdapter } from './types';

// Export types
export * from './types';

// Placeholder for PostgreSQL adapter (for Next.js/self-hosted)
// This would be implemented when migrating to Next.js with API routes
const postgresAdapter: DatabaseAdapter = {
  async getProjectsByUser() {
    throw new Error('PostgreSQL adapter requires Next.js API routes. Set DATABASE_PROVIDER=supabase or migrate to Next.js.');
  },
  async getProjectById() {
    throw new Error('PostgreSQL adapter requires Next.js API routes.');
  },
  async createProject() {
    throw new Error('PostgreSQL adapter requires Next.js API routes.');
  },
  async updateProject() {
    throw new Error('PostgreSQL adapter requires Next.js API routes.');
  },
  async deleteProject() {
    throw new Error('PostgreSQL adapter requires Next.js API routes.');
  },
  async getPublishedProjectById() {
    throw new Error('PostgreSQL adapter requires Next.js API routes.');
  },
  async getPublishedProjectByCode() {
    throw new Error('PostgreSQL adapter requires Next.js API routes.');
  },
  async isPublishCodeUnique() {
    throw new Error('PostgreSQL adapter requires Next.js API routes.');
  },
};

// Select adapter based on configuration
const getAdapter = (): DatabaseAdapter => {
  switch (config.database.provider) {
    case 'supabase':
      return supabaseAdapter;
    case 'postgres':
      return postgresAdapter;
    default:
      console.warn(`Unknown database provider: ${config.database.provider}, falling back to Supabase`);
      return supabaseAdapter;
  }
};

// Export the configured database adapter
export const db: DatabaseAdapter = getAdapter();

// Re-export individual adapters for direct access if needed
export { supabaseAdapter } from './supabase-adapter';

export default db;
