/**
 * Supabase Authentication Adapter
 * 
 * Implements AuthAdapter interface using Supabase Auth
 */

import { supabase } from '@/integrations/supabase/client';
import type { 
  AuthAdapter, 
  AuthUser, 
  AuthSession, 
  AuthResult, 
  SignOutResult,
  AuthStateChangeCallback,
  AuthSubscription 
} from './types';

// Convert Supabase user to AuthUser
const mapUser = (supabaseUser: any): AuthUser | null => {
  if (!supabaseUser) return null;
  
  return {
    id: supabaseUser.id,
    email: supabaseUser.email || '',
    emailVerified: supabaseUser.email_confirmed_at !== null,
    createdAt: supabaseUser.created_at,
    lastSignInAt: supabaseUser.last_sign_in_at || null,
  };
};

// Convert Supabase session to AuthSession
const mapSession = (supabaseSession: any): AuthSession | null => {
  if (!supabaseSession) return null;
  
  return {
    accessToken: supabaseSession.access_token,
    refreshToken: supabaseSession.refresh_token,
    expiresAt: supabaseSession.expires_at || 0,
    user: mapUser(supabaseSession.user)!,
  };
};

export const supabaseAuthAdapter: AuthAdapter = {
  async getSession(): Promise<AuthResult> {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      return { user: null, session: null, error: new Error(error.message) };
    }
    
    const mappedSession = mapSession(session);
    return {
      user: mappedSession?.user || null,
      session: mappedSession,
      error: null,
    };
  },

  async getUser(): Promise<{ user: AuthUser | null; error: Error | null }> {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      return { user: null, error: new Error(error.message) };
    }
    
    return {
      user: mapUser(user),
      error: null,
    };
  },

  async signInWithPassword(email: string, password: string): Promise<AuthResult> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      return { user: null, session: null, error: new Error(error.message) };
    }
    
    const mappedSession = mapSession(data.session);
    return {
      user: mapUser(data.user),
      session: mappedSession,
      error: null,
    };
  },

  async signUp(email: string, password: string, redirectUrl?: string): Promise<AuthResult> {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl || `${window.location.origin}/`,
      },
    });
    
    if (error) {
      return { user: null, session: null, error: new Error(error.message) };
    }
    
    const mappedSession = mapSession(data.session);
    return {
      user: mapUser(data.user),
      session: mappedSession,
      error: null,
    };
  },

  async signOut(): Promise<SignOutResult> {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      return { error: new Error(error.message) };
    }
    
    return { error: null };
  },

  onAuthStateChange(callback: AuthStateChangeCallback): AuthSubscription {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        let mappedEvent: 'SIGNED_IN' | 'SIGNED_OUT' | 'TOKEN_REFRESHED' | 'USER_UPDATED';
        
        switch (event) {
          case 'SIGNED_IN':
          case 'INITIAL_SESSION':
            mappedEvent = 'SIGNED_IN';
            break;
          case 'SIGNED_OUT':
            mappedEvent = 'SIGNED_OUT';
            break;
          case 'TOKEN_REFRESHED':
            mappedEvent = 'TOKEN_REFRESHED';
            break;
          case 'USER_UPDATED':
            mappedEvent = 'USER_UPDATED';
            break;
          default:
            mappedEvent = 'SIGNED_IN';
        }
        
        callback(mappedEvent, mapSession(session));
      }
    );
    
    return {
      unsubscribe: () => subscription.unsubscribe(),
    };
  },

  async refreshSession(): Promise<AuthResult> {
    const { data, error } = await supabase.auth.refreshSession();
    
    if (error) {
      return { user: null, session: null, error: new Error(error.message) };
    }
    
    const mappedSession = mapSession(data.session);
    return {
      user: mapUser(data.user),
      session: mappedSession,
      error: null,
    };
  },
};

export default supabaseAuthAdapter;
