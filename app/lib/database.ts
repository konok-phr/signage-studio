/**
 * Client-side Database Adapter for Next.js
 * 
 * This adapter makes HTTP calls to the Next.js API routes
 * which handle the actual PostgreSQL database operations.
 */

import type { CanvasElement } from '@/types/signage';

export interface Project {
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

export interface ProjectInput {
  name?: string;
  ratio?: string;
  canvas_width?: number;
  canvas_height?: number;
  elements?: CanvasElement[];
  is_published?: boolean;
  publish_code?: string | null;
  published_at?: string | null;
  user_id?: string;
}

export interface PublishedProject {
  id: string;
  name: string;
  ratio: string;
  canvas_width: number;
  canvas_height: number;
  elements: CanvasElement[];
  is_published: boolean;
  publish_code: string;
  published_at: string;
}

export type DatabaseResult<T> = {
  data: T | null;
  error: Error | null;
};

export interface DatabaseAdapter {
  getProjectsByUser(userId: string): Promise<DatabaseResult<Project[]>>;
  getProjectById(id: string, userId: string): Promise<DatabaseResult<Project>>;
  createProject(project: ProjectInput): Promise<DatabaseResult<Project>>;
  updateProject(id: string, userId: string, updates: Partial<ProjectInput>): Promise<DatabaseResult<Project>>;
  deleteProject(id: string, userId: string): Promise<DatabaseResult<{ success: boolean }>>;
  getPublishedProjectById(id: string): Promise<DatabaseResult<PublishedProject>>;
  getPublishedProjectByCode(code: string): Promise<DatabaseResult<PublishedProject>>;
  isPublishCodeUnique(code: string, excludeId?: string): Promise<boolean>;
}

const apiAdapter: DatabaseAdapter = {
  async getProjectsByUser() {
    try {
      const response = await fetch('/api/projects');
      if (!response.ok) {
        const error = await response.json();
        return { data: null, error: new Error(error.error || 'Failed to fetch projects') };
      }
      const data = await response.json();
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error instanceof Error ? error : new Error('Failed to fetch projects') };
    }
  },

  async getProjectById(id: string, userId: string) {
    try {
      const response = await fetch(`/api/projects/${id}`);
      if (!response.ok) {
        const error = await response.json();
        return { data: null, error: new Error(error.error || 'Failed to fetch project') };
      }
      const data = await response.json();
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error instanceof Error ? error : new Error('Failed to fetch project') };
    }
  },

  async createProject(project: ProjectInput) {
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(project),
      });
      if (!response.ok) {
        const error = await response.json();
        return { data: null, error: new Error(error.error || 'Failed to create project') };
      }
      const data = await response.json();
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error instanceof Error ? error : new Error('Failed to create project') };
    }
  },

  async updateProject(id: string, userId: string, updates: Partial<ProjectInput>) {
    try {
      const response = await fetch(`/api/projects/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!response.ok) {
        const error = await response.json();
        return { data: null, error: new Error(error.error || 'Failed to update project') };
      }
      const data = await response.json();
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error instanceof Error ? error : new Error('Failed to update project') };
    }
  },

  async deleteProject(id: string, userId: string) {
    try {
      const response = await fetch(`/api/projects/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const error = await response.json();
        return { data: null, error: new Error(error.error || 'Failed to delete project') };
      }
      return { data: { success: true }, error: null };
    } catch (error) {
      return { data: null, error: error instanceof Error ? error : new Error('Failed to delete project') };
    }
  },

  async getPublishedProjectById(id: string) {
    try {
      const response = await fetch(`/api/projects/published/${id}`);
      if (!response.ok) {
        const error = await response.json();
        return { data: null, error: new Error(error.error || 'Project not found') };
      }
      const data = await response.json();
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error instanceof Error ? error : new Error('Failed to fetch project') };
    }
  },

  async getPublishedProjectByCode(code: string) {
    try {
      const response = await fetch(`/api/projects/by-code/${code}`);
      if (!response.ok) {
        const error = await response.json();
        return { data: null, error: new Error(error.error || 'Project not found') };
      }
      const data = await response.json();
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error instanceof Error ? error : new Error('Failed to fetch project') };
    }
  },

  async isPublishCodeUnique(code: string, excludeId?: string) {
    try {
      const params = new URLSearchParams({ code });
      if (excludeId) params.append('excludeId', excludeId);
      const response = await fetch(`/api/projects/check-code?${params}`);
      if (!response.ok) return false;
      const data = await response.json();
      return data.isUnique;
    } catch {
      return false;
    }
  },
};

export const db = apiAdapter;
export default db;
