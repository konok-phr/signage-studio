'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/auth-context';
import { toast } from 'sonner';
import { Tv } from 'lucide-react';
import type { CanvasElement, AspectRatio } from '@/types/signage';

// Import existing components (these would need to be copied from src/components)
// For now, we'll create a placeholder that shows the structure

const RATIO_DIMENSIONS: Record<AspectRatio, { width: number; height: number }> = {
  '16:9': { width: 1920, height: 1080 },
  '9:16': { width: 1080, height: 1920 },
  '4:3': { width: 1440, height: 1080 },
  '1:1': { width: 1080, height: 1080 },
};

interface Project {
  id: string;
  name: string;
  ratio: string;
  canvas_width: number;
  canvas_height: number;
  elements: CanvasElement[];
  is_published: boolean;
  publish_code: string | null;
}

export default function EditorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = searchParams.get('project');
  const { user, isLoading: authLoading } = useAuth();

  const [project, setProject] = useState<Project | null>(null);
  const [elements, setElements] = useState<CanvasElement[]>([]);
  const [ratio, setRatio] = useState<AspectRatio>('16:9');
  const [projectName, setProjectName] = useState('Untitled Project');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load project if editing existing
  useEffect(() => {
    const loadProject = async () => {
      if (!projectId || !user) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/projects/${projectId}`);
        if (response.ok) {
          const data = await response.json();
          setProject(data);
          setElements(data.elements || []);
          setRatio(data.ratio as AspectRatio);
          setProjectName(data.name);
        } else {
          toast.error('Project not found');
          router.push('/projects');
        }
      } catch (error) {
        toast.error('Failed to load project');
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      loadProject();
    }
  }, [projectId, user, authLoading, router]);

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const dimensions = RATIO_DIMENSIONS[ratio];
      
      if (project?.id) {
        // Update existing project
        const response = await fetch(`/api/projects/${project.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: projectName,
            ratio,
            canvas_width: dimensions.width,
            canvas_height: dimensions.height,
            elements,
          }),
        });

        if (response.ok) {
          toast.success('Project saved');
        } else {
          throw new Error('Save failed');
        }
      } else {
        // Create new project
        const response = await fetch('/api/projects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: projectName,
            ratio,
            canvas_width: dimensions.width,
            canvas_height: dimensions.height,
            elements,
          }),
        });

        if (response.ok) {
          const newProject = await response.json();
          setProject(newProject);
          router.replace(`/editor?project=${newProject.id}`);
          toast.success('Project created');
        } else {
          throw new Error('Create failed');
        }
      }
    } catch (error) {
      toast.error('Failed to save project');
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="h-14 border-b border-border flex items-center justify-between px-4 bg-background">
        <div className="flex items-center gap-4">
          <Link href="/projects" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
            <Tv className="h-5 w-5" />
            <span className="font-semibold">Digital Signage</span>
          </Link>
          <span className="text-muted-foreground">/</span>
          <input
            type="text"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            className="bg-transparent border-none text-sm font-medium focus:outline-none focus:ring-0"
            placeholder="Project Name"
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </header>

      {/* Main Editor Area */}
      <div className="flex-1 flex">
        {/* Left Sidebar - Media */}
        <aside className="w-64 border-r border-border bg-card p-4">
          <h3 className="font-semibold mb-4">Media Elements</h3>
          <div className="space-y-2">
            <div className="p-3 border border-dashed border-border rounded-lg text-center text-sm text-muted-foreground cursor-pointer hover:border-primary hover:text-primary">
              + Add Image
            </div>
            <div className="p-3 border border-dashed border-border rounded-lg text-center text-sm text-muted-foreground cursor-pointer hover:border-primary hover:text-primary">
              + Add Video
            </div>
            <div className="p-3 border border-dashed border-border rounded-lg text-center text-sm text-muted-foreground cursor-pointer hover:border-primary hover:text-primary">
              + Add Text
            </div>
          </div>
        </aside>

        {/* Canvas Area */}
        <main className="flex-1 flex items-center justify-center bg-muted/30 p-8">
          <div 
            className="bg-card border border-border rounded-lg shadow-lg"
            style={{
              width: '80%',
              maxWidth: RATIO_DIMENSIONS[ratio].width / 2,
              aspectRatio: `${RATIO_DIMENSIONS[ratio].width} / ${RATIO_DIMENSIONS[ratio].height}`,
            }}
          >
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <p className="text-lg font-medium">Canvas</p>
                <p className="text-sm">{ratio} • {RATIO_DIMENSIONS[ratio].width}×{RATIO_DIMENSIONS[ratio].height}</p>
                <p className="text-xs mt-2">{elements.length} elements</p>
              </div>
            </div>
          </div>
        </main>

        {/* Right Sidebar - Properties */}
        <aside className="w-72 border-l border-border bg-card p-4">
          <h3 className="font-semibold mb-4">Properties</h3>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Aspect Ratio</label>
              <select
                value={ratio}
                onChange={(e) => setRatio(e.target.value as AspectRatio)}
                className="w-full mt-1 px-3 py-2 border border-border rounded-md bg-background text-sm"
              >
                <option value="16:9">16:9 (Landscape)</option>
                <option value="9:16">9:16 (Portrait)</option>
                <option value="4:3">4:3 (Standard)</option>
                <option value="1:1">1:1 (Square)</option>
              </select>
            </div>

            <div className="pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground">
                Select an element to edit its properties
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
