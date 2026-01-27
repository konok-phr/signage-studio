import { useState, useCallback, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/integrations/supabase/client';
import { CanvasElement, ASPECT_RATIOS } from '@/types/signage';

interface UseSignageProjectOptions {
  initialProjectId?: string | null;
}

export function useSignageProject(options: UseSignageProjectOptions = {}) {
  const [projectId, setProjectId] = useState<string | null>(options.initialProjectId || null);
  const [projectName, setProjectName] = useState('Untitled Project');
  const [ratio, setRatio] = useState('16:9');
  const [elements, setElements] = useState<CanvasElement[]>([]);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [isPublished, setIsPublished] = useState(false);
  const [publishCode, setPublishCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Load existing project
  const loadProject = useCallback(async (id: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('signage_projects')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        setProjectId(data.id);
        setProjectName(data.name);
        setRatio(data.ratio);
        setElements(data.elements as unknown as CanvasElement[]);
        setIsPublished(data.is_published);
        setPublishCode(data.publish_code);
      }
      
      return data;
    } catch (error) {
      console.error('Error loading project:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load project on mount if initialProjectId is provided
  useEffect(() => {
    if (options.initialProjectId) {
      loadProject(options.initialProjectId);
    }
  }, [options.initialProjectId, loadProject]);

  const currentRatio = ASPECT_RATIOS.find(r => r.value === ratio) || ASPECT_RATIOS[0];

  const addElement = useCallback((element: Omit<CanvasElement, 'id' | 'zIndex'>) => {
    const newElement: CanvasElement = {
      ...element,
      id: uuidv4(),
      zIndex: elements.length,
    } as CanvasElement;
    setElements(prev => [...prev, newElement]);
    setSelectedElementId(newElement.id);
  }, [elements.length]);

  const updateElement = useCallback((id: string, updates: Partial<CanvasElement>) => {
    setElements(prev => prev.map(el => 
      el.id === id ? { ...el, ...updates } as CanvasElement : el
    ));
  }, []);

  const deleteElement = useCallback((id: string) => {
    setElements(prev => prev.filter(el => el.id !== id));
    if (selectedElementId === id) {
      setSelectedElementId(null);
    }
  }, [selectedElementId]);

  const duplicateElement = useCallback((id: string) => {
    const element = elements.find(el => el.id === id);
    if (element) {
      const newElement: CanvasElement = {
        ...element,
        id: uuidv4(),
        position: {
          x: element.position.x + 20,
          y: element.position.y + 20,
        },
        zIndex: elements.length,
      };
      setElements(prev => [...prev, newElement]);
      setSelectedElementId(newElement.id);
    }
  }, [elements]);

  const bringToFront = useCallback((id: string) => {
    setElements(prev => {
      const maxZ = Math.max(...prev.map(el => el.zIndex));
      return prev.map(el => 
        el.id === id ? { ...el, zIndex: maxZ + 1 } : el
      );
    });
  }, []);

  const sendToBack = useCallback((id: string) => {
    setElements(prev => {
      const minZ = Math.min(...prev.map(el => el.zIndex));
      return prev.map(el => 
        el.id === id ? { ...el, zIndex: minZ - 1 } : el
      );
    });
  }, []);

  const clearCanvas = useCallback(() => {
    setElements([]);
    setSelectedElementId(null);
  }, []);

  // Reset to new project state
  const resetProject = useCallback(() => {
    setProjectId(null);
    setProjectName('Untitled Project');
    setRatio('16:9');
    setElements([]);
    setSelectedElementId(null);
    setIsPublished(false);
    setPublishCode(null);
  }, []);

  const selectedElement = elements.find(el => el.id === selectedElementId) || null;

  return {
    projectId,
    setProjectId,
    projectName,
    setProjectName,
    ratio,
    setRatio,
    currentRatio,
    elements,
    setElements,
    selectedElementId,
    setSelectedElementId,
    selectedElement,
    isPublished,
    setIsPublished,
    publishCode,
    setPublishCode,
    isLoading,
    loadProject,
    resetProject,
    addElement,
    updateElement,
    deleteElement,
    duplicateElement,
    bringToFront,
    sendToBack,
    clearCanvas,
  };
}
