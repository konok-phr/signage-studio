'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { LivePreview } from '@/components/signage/LivePreview';
import type { CanvasElement } from '@/types/signage';

interface ProjectData {
  id: string;
  name: string;
  ratio: string;
  canvas_width: number;
  canvas_height: number;
  elements: CanvasElement[];
  is_published: boolean;
}

export default function DisplayPage() {
  const params = useParams();
  const id = params.id as string;
  
  const [project, setProject] = useState<ProjectData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProject = async () => {
      try {
        const response = await fetch(`/api/projects/published/${id}`);
        if (!response.ok) {
          setError('Display not found or not published');
          return;
        }
        const data = await response.json();
        setProject(data);
      } catch (err) {
        setError('Failed to load display');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadProject();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-center text-white gap-4">
        <div className="text-6xl">📺</div>
        <h1 className="text-2xl font-bold">{error || 'Display Not Found'}</h1>
        <p className="text-gray-400">This display is not available or has been unpublished.</p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black overflow-hidden">
      <LivePreview
        elements={project.elements}
        ratio={project.ratio}
        canvasWidth={project.canvas_width}
        canvasHeight={project.canvas_height}
        isFullscreen={true}
      />
    </div>
  );
}
