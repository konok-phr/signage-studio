import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Template, CanvasElement, TemplateElement } from '@/types/signage';
import { v4 as uuidv4 } from 'uuid';

interface TemplatesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectTemplate: (elements: CanvasElement[], ratio: string) => void;
}

const templates: Template[] = [
  {
    id: 'welcome',
    name: 'Welcome Screen',
    description: 'Clean welcome display with logo and text',
    thumbnail: '/placeholder.svg',
    ratio: '16:9',
    elements: [
      {
        type: 'image',
        position: { x: 660, y: 200 },
        size: { width: 600, height: 400 },
        src: '',
        objectFit: 'contain',
      },
      {
        type: 'text',
        position: { x: 460, y: 650 },
        size: { width: 1000, height: 100 },
        content: 'Welcome',
        fontSize: 72,
        fontWeight: 'bold',
        color: '#1a1a1a',
        backgroundColor: 'transparent',
        textAlign: 'center',
        fontFamily: 'sans-serif',
      },
    ],
  },
  {
    id: 'menu-board',
    name: 'Menu Board',
    description: 'Restaurant menu layout',
    thumbnail: '/placeholder.svg',
    ratio: '16:9',
    elements: [
      {
        type: 'text',
        position: { x: 100, y: 50 },
        size: { width: 1720, height: 120 },
        content: 'Today\'s Menu',
        fontSize: 80,
        fontWeight: 'bold',
        color: '#ffffff',
        backgroundColor: '#1a1a1a',
        textAlign: 'center',
        fontFamily: 'sans-serif',
      },
      {
        type: 'text',
        position: { x: 100, y: 200 },
        size: { width: 800, height: 700 },
        content: 'Main Dishes\n\n• Grilled Salmon - $24\n• Ribeye Steak - $32\n• Pasta Primavera - $18',
        fontSize: 36,
        fontWeight: 'normal',
        color: '#333333',
        backgroundColor: '#f8f8f8',
        textAlign: 'left',
        fontFamily: 'sans-serif',
      },
    ],
  },
  {
    id: 'promo',
    name: 'Promotion Display',
    description: 'Eye-catching promo with ticker',
    thumbnail: '/placeholder.svg',
    ratio: '16:9',
    elements: [
      {
        type: 'image',
        position: { x: 0, y: 0 },
        size: { width: 1920, height: 900 },
        src: '',
        objectFit: 'cover',
      },
      {
        type: 'ticker',
        position: { x: 0, y: 920 },
        size: { width: 1920, height: 80 },
        text: '🎉 Special Offer! Limited time only! 🎉 Don\'t miss out on our amazing deals!',
        speed: 5,
        fontSize: 36,
        color: '#ffffff',
        backgroundColor: '#e11d48',
      },
    ],
  },
  {
    id: 'portrait-social',
    name: 'Portrait Social',
    description: 'Vertical social media style',
    thumbnail: '/placeholder.svg',
    ratio: '9:16',
    elements: [
      {
        type: 'image',
        position: { x: 0, y: 0 },
        size: { width: 1080, height: 1200 },
        src: '',
        objectFit: 'cover',
      },
      {
        type: 'text',
        position: { x: 50, y: 1250 },
        size: { width: 980, height: 200 },
        content: 'Follow us @yourhandle',
        fontSize: 48,
        fontWeight: 'bold',
        color: '#1a1a1a',
        backgroundColor: 'transparent',
        textAlign: 'center',
        fontFamily: 'sans-serif',
      },
    ],
  },
  {
    id: 'blank',
    name: 'Blank Canvas',
    description: 'Start from scratch',
    thumbnail: '/placeholder.svg',
    ratio: '16:9',
    elements: [],
  },
];

function templateElementToCanvasElement(el: TemplateElement, index: number): CanvasElement {
  const base = {
    id: uuidv4(),
    position: el.position,
    size: el.size,
    zIndex: index,
  };

  switch (el.type) {
    case 'image':
      return {
        ...base,
        type: 'image',
        src: el.src || '',
        alt: el.alt,
        objectFit: el.objectFit,
      };
    case 'text':
      return {
        ...base,
        type: 'text',
        content: el.content || '',
        fontSize: el.fontSize || 24,
        fontWeight: el.fontWeight || 'normal',
        color: el.color || '#000000',
        backgroundColor: el.backgroundColor || 'transparent',
        textAlign: el.textAlign || 'left',
        fontFamily: el.fontFamily || 'sans-serif',
      };
    case 'ticker':
      return {
        ...base,
        type: 'ticker',
        text: el.text || '',
        speed: el.speed || 5,
        fontSize: el.fontSize || 24,
        color: el.color || '#ffffff',
        backgroundColor: el.backgroundColor || '#000000',
      };
    case 'video':
      return {
        ...base,
        type: 'video',
        src: el.src || '',
        autoPlay: el.autoPlay ?? true,
        loop: el.loop ?? true,
        muted: el.muted ?? true,
      };
    case 'slideshow':
      return {
        ...base,
        type: 'slideshow',
        images: el.images || [],
        transition: el.transition || 'fade',
        autoPlay: el.autoPlay ?? true,
      };
    default:
      throw new Error(`Unknown element type`);
  }
}

export function TemplatesDialog({ open, onOpenChange, onSelectTemplate }: TemplatesDialogProps) {
  const handleSelect = (template: Template) => {
    const elementsWithIds: CanvasElement[] = template.elements.map((el, index) => 
      templateElementToCanvasElement(el, index)
    );
    
    onSelectTemplate(elementsWithIds, template.ratio);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Choose a Template</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-3 gap-4 mt-4">
          {templates.map((template) => (
            <Card 
              key={template.id}
              className="cursor-pointer hover:ring-2 hover:ring-primary transition-all"
              onClick={() => handleSelect(template)}
            >
              <CardContent className="p-4">
                <div className="aspect-video bg-muted rounded-md mb-3 flex items-center justify-center text-muted-foreground text-xs">
                  {template.ratio}
                </div>
                <h3 className="font-medium text-sm">{template.name}</h3>
                <p className="text-xs text-muted-foreground">{template.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
