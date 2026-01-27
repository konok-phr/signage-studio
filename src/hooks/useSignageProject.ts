import { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { CanvasElement, ASPECT_RATIOS } from '@/types/signage';

export function useSignageProject() {
  const [projectId, setProjectId] = useState<string | null>(null);
  const [projectName, setProjectName] = useState('Untitled Project');
  const [ratio, setRatio] = useState('16:9');
  const [elements, setElements] = useState<CanvasElement[]>([]);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [isPublished, setIsPublished] = useState(false);

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
    addElement,
    updateElement,
    deleteElement,
    duplicateElement,
    bringToFront,
    sendToBack,
    clearCanvas,
  };
}
