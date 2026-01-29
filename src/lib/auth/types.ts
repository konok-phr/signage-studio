/**
 * Authentication abstraction types
 * 
 * These types define the interface for authentication operations,
 * allowing different implementations (Supabase Auth, Local JWT, etc.)
 */

// User type (common across all providers)
export interface AuthUser {
  id: string;
  email: string;
  emailVerified: boolean;
  createdAt: string;
  lastSignInAt: string | null;
}

// Session type
export interface AuthSession {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
  user: AuthUser;
}

// Auth result types
export interface AuthResult {
  user: AuthUser | null;
  session: AuthSession | null;
  error: Error | null;
}

export interface SignOutResult {
  error: Error | null;
}

// Auth state change callback
export type AuthStateChangeCallback = (
  event: 'SIGNED_IN' | 'SIGNED_OUT' | 'TOKEN_REFRESHED' | 'USER_UPDATED',
  session: AuthSession | null
) => void;

// Auth subscription
export interface AuthSubscription {
  unsubscribe: () => void;
}

// Auth adapter interface
export interface AuthAdapter {
  // Get current session
  getSession(): Promise<AuthResult>;
  
  // Get current user
  getUser(): Promise<{ user: AuthUser | null; error: Error | null }>;
  
  // Sign in with email/password
  signInWithPassword(email: string, password: string): Promise<AuthResult>;
  
  // Sign up with email/password
  signUp(email: string, password: string, redirectUrl?: string): Promise<AuthResult>;
  
  // Sign out
  signOut(): Promise<SignOutResult>;
  
  // Listen for auth state changes
  onAuthStateChange(callback: AuthStateChangeCallback): AuthSubscription;
  
  // Refresh session (if applicable)
  refreshSession?(): Promise<AuthResult>;
}
