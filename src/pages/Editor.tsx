import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Json } from '@/integrations/supabase/types';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { MediaSidebar } from '@/components/signage/MediaSidebar';
import { DesignCanvas } from '@/components/signage/DesignCanvas';
import { LivePreview } from '@/components/signage/LivePreview';
import { PropertyPanel } from '@/components/signage/PropertyPanel';
import { EditorToolbar } from '@/components/signage/EditorToolbar';
import { TemplatesDialog } from '@/components/signage/TemplatesDialog';
import { useSignageProject } from '@/hooks/useSignageProject';
import { ElementType, CanvasElement, ImageElement, TextElement, TickerElement, VideoElement, SlideshowElement } from '@/types/signage';

export default function Editor() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showPropertyPanel, setShowPropertyPanel] = useState(true);

  const {
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
  } = useSignageProject();

  const handleAddElement = (type: ElementType) => {
    const baseElement = {
      position: { x: 100, y: 100 },
      size: { width: 300, height: 200 },
    };

    switch (type) {
      case 'image':
        addElement({
          ...baseElement,
          type: 'image',
          src: '',
          objectFit: 'cover',
        } as Omit<ImageElement, 'id' | 'zIndex'>);
        break;
      case 'text':
        addElement({
          ...baseElement,
          type: 'text',
          content: 'Enter your text',
          fontSize: 32,
          fontWeight: 'normal',
          color: '#000000',
          backgroundColor: 'transparent',
          textAlign: 'center',
          fontFamily: 'sans-serif',
        } as Omit<TextElement, 'id' | 'zIndex'>);
        break;
      case 'ticker':
        addElement({
          ...baseElement,
          size: { width: 600, height: 60 },
          type: 'ticker',
          text: 'Breaking news: Your ticker text here...',
          speed: 5,
          fontSize: 24,
          color: '#ffffff',
          backgroundColor: '#000000',
        } as Omit<TickerElement, 'id' | 'zIndex'>);
        break;
      case 'video':
        addElement({
          ...baseElement,
          type: 'video',
          src: '',
          autoPlay: true,
          loop: true,
          muted: true,
        } as Omit<VideoElement, 'id' | 'zIndex'>);
        break;
      case 'slideshow':
        addElement({
          ...baseElement,
          type: 'slideshow',
          images: [],
          transition: 'fade',
          autoPlay: true,
        } as Omit<SlideshowElement, 'id' | 'zIndex'>);
        break;
    }
  };

  const handleSelectTemplate = (templateElements: CanvasElement[], templateRatio: string) => {
    setElements(templateElements);
    setRatio(templateRatio);
    setSelectedElementId(null);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const projectData = {
        name: projectName,
        ratio,
        canvas_width: currentRatio.width,
        canvas_height: currentRatio.height,
        elements: JSON.parse(JSON.stringify(elements)) as Json,
      };

      if (projectId) {
        const { error } = await supabase
          .from('signage_projects')
          .update(projectData)
          .eq('id', projectId);
        
        if (error) throw error;
        toast.success('Project saved!');
      } else {
        const { data, error } = await supabase
          .from('signage_projects')
          .insert(projectData)
          .select()
          .single();
        
        if (error) throw error;
        setProjectId(data.id);
        toast.success('Project created!');
      }
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save project');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    setIsSaving(true);
    try {
      const projectData = {
        name: projectName,
        ratio,
        canvas_width: currentRatio.width,
        canvas_height: currentRatio.height,
        elements: JSON.parse(JSON.stringify(elements)) as Json,
        is_published: true,
        published_at: new Date().toISOString(),
      };

      let savedProjectId = projectId;

      if (projectId) {
        const { error } = await supabase
          .from('signage_projects')
          .update(projectData)
          .eq('id', projectId);
        
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('signage_projects')
          .insert(projectData)
          .select()
          .single();
        
        if (error) throw error;
        savedProjectId = data.id;
        setProjectId(data.id);
      }

      setIsPublished(true);
      const playerUrl = `${window.location.origin}/player/${savedProjectId}`;
      await navigator.clipboard.writeText(playerUrl);
      toast.success('Published! Player URL copied to clipboard');
    } catch (error) {
      console.error('Publish error:', error);
      toast.error('Failed to publish project');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      <EditorToolbar
        projectName={projectName}
        onProjectNameChange={setProjectName}
        ratio={ratio}
        onRatioChange={setRatio}
        onSave={handleSave}
        onPublish={handlePublish}
        onOpenTemplates={() => setTemplatesOpen(true)}
        onClearCanvas={clearCanvas}
        isSaving={isSaving}
        isPublished={isPublished}
      />

      <ResizablePanelGroup direction="horizontal" className="flex-1">
        <ResizablePanel defaultSize={15} minSize={12} maxSize={20}>
          <MediaSidebar onAddElement={handleAddElement} />
        </ResizablePanel>
        
        <ResizableHandle withHandle />
        
        <ResizablePanel defaultSize={50} minSize={30}>
          <DesignCanvas
            ratio={currentRatio}
            elements={elements}
            selectedElementId={selectedElementId}
            onSelectElement={setSelectedElementId}
            onUpdateElement={updateElement}
            onDeleteElement={deleteElement}
          />
        </ResizablePanel>
        
        <ResizableHandle withHandle />
        
        <ResizablePanel defaultSize={20} minSize={15} maxSize={25}>
          <LivePreview ratio={currentRatio} elements={elements} />
        </ResizablePanel>
        
        <ResizableHandle withHandle />
        
        <ResizablePanel defaultSize={15} minSize={12} maxSize={25}>
          <PropertyPanel
            element={selectedElement}
            onUpdate={(updates) => selectedElementId && updateElement(selectedElementId, updates)}
            onDelete={() => selectedElementId && deleteElement(selectedElementId)}
            onDuplicate={() => selectedElementId && duplicateElement(selectedElementId)}
            onBringToFront={() => selectedElementId && bringToFront(selectedElementId)}
            onSendToBack={() => selectedElementId && sendToBack(selectedElementId)}
          />
        </ResizablePanel>
      </ResizablePanelGroup>

      <TemplatesDialog
        open={templatesOpen}
        onOpenChange={setTemplatesOpen}
        onSelectTemplate={handleSelectTemplate}
      />
    </div>
  );
}
