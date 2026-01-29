/**
 * Supabase Database Adapter
 * 
 * Implements DatabaseAdapter interface using Supabase client
 */

import { supabase } from '@/integrations/supabase/client';
import type { 
  DatabaseAdapter, 
  SignageProjectRow, 
  PublishedProjectData,
  QueryResult, 
  QueryArrayResult 
} from './types';
import type { CanvasElement } from '@/types/signage';
import type { Json } from '@/integrations/supabase/types';

// Helper to convert JSONB to typed elements
const parseElements = (elements: Json): CanvasElement[] => {
  if (Array.isArray(elements)) {
    return elements as unknown as CanvasElement[];
  }
  return [];
};

// Helper to convert row to typed result
const mapProjectRow = (row: any): SignageProjectRow => ({
  id: row.id,
  user_id: row.user_id,
  name: row.name,
  ratio: row.ratio,
  canvas_width: row.canvas_width,
  canvas_height: row.canvas_height,
  elements: parseElements(row.elements),
  is_published: row.is_published,
  publish_code: row.publish_code,
  published_at: row.published_at,
  created_at: row.created_at,
  updated_at: row.updated_at,
});

export const supabaseAdapter: DatabaseAdapter = {
  // Get all projects for a user
  async getProjectsByUser(userId: string): Promise<QueryArrayResult<SignageProjectRow>> {
    const { data, error } = await supabase
      .from('signage_projects')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) {
      return { data: [], error: new Error(error.message) };
    }

    return {
      data: (data || []).map(mapProjectRow),
      error: null,
    };
  },

  // Get a specific project by ID (with user ownership check via RLS)
  async getProjectById(projectId: string, userId: string): Promise<QueryResult<SignageProjectRow>> {
    const { data, error } = await supabase
      .from('signage_projects')
      .select('*')
      .eq('id', projectId)
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    return {
      data: data ? mapProjectRow(data) : null,
      error: null,
    };
  },

  // Create a new project
  async createProject(project: Partial<SignageProjectRow>): Promise<QueryResult<SignageProjectRow>> {
    const { data, error } = await supabase
      .from('signage_projects')
      .insert({
        user_id: project.user_id!,
        name: project.name || 'Untitled Project',
        ratio: project.ratio || '16:9',
        canvas_width: project.canvas_width || 1920,
        canvas_height: project.canvas_height || 1080,
        elements: (project.elements || []) as unknown as Json,
        is_published: project.is_published || false,
        publish_code: project.publish_code || null,
        published_at: project.published_at || null,
      })
      .select()
      .single();

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    return {
      data: mapProjectRow(data),
      error: null,
    };
  },

  // Update an existing project
  async updateProject(
    projectId: string, 
    userId: string, 
    updates: Partial<SignageProjectRow>
  ): Promise<QueryResult<SignageProjectRow>> {
    const updateData: any = {};
    
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.ratio !== undefined) updateData.ratio = updates.ratio;
    if (updates.canvas_width !== undefined) updateData.canvas_width = updates.canvas_width;
    if (updates.canvas_height !== undefined) updateData.canvas_height = updates.canvas_height;
    if (updates.elements !== undefined) updateData.elements = updates.elements as unknown as Json;
    if (updates.is_published !== undefined) updateData.is_published = updates.is_published;
    if (updates.publish_code !== undefined) updateData.publish_code = updates.publish_code;
    if (updates.published_at !== undefined) updateData.published_at = updates.published_at;

    const { data, error } = await supabase
      .from('signage_projects')
      .update(updateData)
      .eq('id', projectId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    return {
      data: mapProjectRow(data),
      error: null,
    };
  },

  // Delete a project
  async deleteProject(projectId: string, userId: string): Promise<QueryResult<null>> {
    const { error } = await supabase
      .from('signage_projects')
      .delete()
      .eq('id', projectId)
      .eq('user_id', userId);

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    return { data: null, error: null };
  },

  // Get published project by ID (public access via RPC)
  async getPublishedProjectById(projectId: string): Promise<QueryResult<PublishedProjectData>> {
    const { data, error } = await supabase
      .rpc('get_published_project_by_id', { project_id: projectId });

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    if (!data || data.length === 0) {
      return { data: null, error: null };
    }

    const row = data[0];
    return {
      data: {
        id: row.id,
        name: row.name,
        ratio: row.ratio,
        canvas_width: row.canvas_width,
        canvas_height: row.canvas_height,
        elements: parseElements(row.elements),
        is_published: row.is_published,
        published_at: row.published_at,
        publish_code: row.publish_code,
      },
      error: null,
    };
  },

  // Get published project by code (public access via RPC)
  async getPublishedProjectByCode(code: string): Promise<QueryResult<PublishedProjectData>> {
    const { data, error } = await supabase
      .rpc('get_published_project_by_code', { code });

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    if (!data || data.length === 0) {
      return { data: null, error: null };
    }

    const row = data[0];
    return {
      data: {
        id: row.id,
        name: row.name,
        ratio: row.ratio,
        canvas_width: row.canvas_width,
        canvas_height: row.canvas_height,
        elements: parseElements(row.elements),
        is_published: row.is_published,
        published_at: row.published_at,
        publish_code: row.publish_code,
      },
      error: null,
    };
  },

  // Check if a publish code is unique
  async isPublishCodeUnique(code: string): Promise<boolean> {
    const { data } = await supabase
      .from('signage_projects')
      .select('id')
      .eq('publish_code', code.toUpperCase())
      .maybeSingle();
    
    return data === null;
  },
};

export default supabaseAdapter;
