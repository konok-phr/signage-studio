/**
 * Authentication Abstraction Layer
 * 
 * Exports the appropriate auth adapter based on environment configuration.
 * This allows the application to switch between Supabase Auth and local JWT
 * without changing any application code.
 * 
 * Usage:
 *   import { auth } from '@/lib/auth';
 *   const { user, error } = await auth.signInWithPassword(email, password);
 */

import { config } from '@/lib/config';
import { supabaseAuthAdapter } from './supabase-adapter';
import type { AuthAdapter } from './types';

// Export types
export * from './types';

// Placeholder for local JWT adapter (for Next.js/self-hosted)
// This would be implemented when migrating to Next.js with API routes
const localAuthAdapter: AuthAdapter = {
  async getSession() {
    throw new Error('Local auth adapter requires Next.js API routes. Set AUTH_PROVIDER=supabase or migrate to Next.js.');
  },
  async getUser() {
    throw new Error('Local auth adapter requires Next.js API routes.');
  },
  async signInWithPassword() {
    throw new Error('Local auth adapter requires Next.js API routes.');
  },
  async signUp() {
    throw new Error('Local auth adapter requires Next.js API routes.');
  },
  async signOut() {
    throw new Error('Local auth adapter requires Next.js API routes.');
  },
  onAuthStateChange() {
    throw new Error('Local auth adapter requires Next.js API routes.');
  },
};

// Select adapter based on configuration
const getAdapter = (): AuthAdapter => {
  switch (config.auth.provider) {
    case 'supabase':
      return supabaseAuthAdapter;
    case 'local':
      return localAuthAdapter;
    default:
      console.warn(`Unknown auth provider: ${config.auth.provider}, falling back to Supabase`);
      return supabaseAuthAdapter;
  }
};

// Export the configured auth adapter
export const auth: AuthAdapter = getAdapter();

// Re-export individual adapters for direct access if needed
export { supabaseAuthAdapter } from './supabase-adapter';

export default auth;
