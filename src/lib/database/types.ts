/**
 * Database abstraction types
 * 
 * These types define the interface for database operations,
 * allowing different implementations (Supabase, PostgreSQL, etc.)
 */

import type { SignageProject, CanvasElement } from '@/types/signage';

// Database row types (matching Supabase schema)
export interface SignageProjectRow {
  id: string;
  user_id: string;
  name: string;
  ratio: string;
  canvas_width: number;
  canvas_height: number;
  elements: CanvasElement[];
  is_published: boolean;
  publish_code: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserRow {
  id: string;
  email: string;
  password_hash?: string; // Only for local auth
  created_at: string;
  updated_at: string;
  email_verified: boolean;
  email_verified_at: string | null;
  last_sign_in_at: string | null;
}

export interface SessionRow {
  id: string;
  user_id: string;
  refresh_token: string;
  expires_at: string;
  created_at: string;
  user_agent: string | null;
  ip_address: string | null;
}

// Query result types
export interface QueryResult<T> {
  data: T | null;
  error: Error | null;
}

export interface QueryArrayResult<T> {
  data: T[];
  error: Error | null;
}

// Published project (public access, limited fields)
export interface PublishedProjectData {
  id: string;
  name: string;
  ratio: string;
  canvas_width: number;
  canvas_height: number;
  elements: CanvasElement[];
  is_published: boolean;
  published_at: string | null;
  publish_code: string | null;
}

// Database interface - all implementations must satisfy this
export interface DatabaseAdapter {
  // Projects
  getProjectsByUser(userId: string): Promise<QueryArrayResult<SignageProjectRow>>;
  getProjectById(projectId: string, userId: string): Promise<QueryResult<SignageProjectRow>>;
  createProject(project: Partial<SignageProjectRow>): Promise<QueryResult<SignageProjectRow>>;
  updateProject(projectId: string, userId: string, updates: Partial<SignageProjectRow>): Promise<QueryResult<SignageProjectRow>>;
  deleteProject(projectId: string, userId: string): Promise<QueryResult<null>>;
  
  // Published projects (public access)
  getPublishedProjectById(projectId: string): Promise<QueryResult<PublishedProjectData>>;
  getPublishedProjectByCode(code: string): Promise<QueryResult<PublishedProjectData>>;
  
  // Publish code utilities
  isPublishCodeUnique(code: string): Promise<boolean>;
}
