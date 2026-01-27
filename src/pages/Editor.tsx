import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DndContext, DragEndEvent, useSensor, useSensors, PointerSensor } from '@dnd-kit/core';
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
import { PublishModal } from '@/components/signage/PublishModal';
import { useSignageProject } from '@/hooks/useSignageProject';
import { useAuth } from '@/hooks/useAuth';
import { ElementType, CanvasElement, ImageElement, TextElement, TickerElement, VideoElement, SlideshowElement } from '@/types/signage';

// Generate a random 6-character code
function generatePublishCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Generate a unique publish code with collision detection
async function generateUniquePublishCode(): Promise<string> {
  const maxAttempts = 10;
  
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const code = generatePublishCode();
    const { data } = await supabase
      .from('signage_projects')
      .select('id')
      .eq('publish_code', code)
      .maybeSingle();
    
    if (!data) return code;
  }
  throw new Error('Failed to generate unique publish code. Please try again.');
}

export default function Editor() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [publishModalOpen, setPublishModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [publishCode, setPublishCode] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );
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

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && over.id === 'canvas-drop-zone') {
      const type = active.data.current?.type as ElementType;
      if (type) {
        handleAddElement(type);
        toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} element added!`);
      }
    }
  };

  const handleSelectTemplate = (templateElements: CanvasElement[], templateRatio: string) => {
    setElements(templateElements);
    setRatio(templateRatio);
    setSelectedElementId(null);
  };

  const handleSave = async () => {
    if (!user) {
      toast.error('You must be signed in to save projects');
      return;
    }

    setIsSaving(true);
    try {
      const projectData = {
        name: projectName,
        ratio,
        canvas_width: currentRatio.width,
        canvas_height: currentRatio.height,
        elements: JSON.parse(JSON.stringify(elements)) as Json,
        user_id: user.id,
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
    if (!user) {
      toast.error('You must be signed in to publish projects');
      return;
    }

    setIsSaving(true);
    try {
      const code = publishCode || await generateUniquePublishCode();
      
      const projectData = {
        name: projectName,
        ratio,
        canvas_width: currentRatio.width,
        canvas_height: currentRatio.height,
        elements: JSON.parse(JSON.stringify(elements)) as Json,
        is_published: true,
        published_at: new Date().toISOString(),
        publish_code: code,
        user_id: user.id,
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
      setPublishCode(code);
      setPublishModalOpen(true);
    } catch (error) {
      console.error('Publish error:', error);
      toast.error('Failed to publish project');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
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
          publishCode={publishCode}
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
          
          {/* Right panel: Preview + Properties in vertical split */}
          <ResizablePanel defaultSize={35} minSize={25} maxSize={45}>
            <ResizablePanelGroup direction="vertical">
              <ResizablePanel defaultSize={50} minSize={30}>
                <LivePreview ratio={currentRatio} elements={elements} />
              </ResizablePanel>
              
              <ResizableHandle withHandle />
              
              <ResizablePanel defaultSize={50} minSize={30}>
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
          </ResizablePanel>
        </ResizablePanelGroup>

        <TemplatesDialog
          open={templatesOpen}
          onOpenChange={setTemplatesOpen}
          onSelectTemplate={handleSelectTemplate}
        />

        {publishCode && projectId && (
          <PublishModal
            open={publishModalOpen}
            onOpenChange={setPublishModalOpen}
            publishCode={publishCode}
            projectId={projectId}
          />
        )}
      </div>
    </DndContext>
  );
}
