import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Template, CanvasElement, TemplateElement } from '@/types/signage';
import { v4 as uuidv4 } from 'uuid';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Monitor, Smartphone, Square, Utensils, Store, Building2, Megaphone, Calendar, Users } from 'lucide-react';

interface TemplatesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectTemplate: (elements: CanvasElement[], ratio: string) => void;
}

const templates: Template[] = [
  // Landscape 16:9 Templates
  {
    id: 'welcome',
    name: 'Welcome Screen',
    description: 'Clean welcome display with logo and text',
    thumbnail: '/placeholder.svg',
    ratio: '16:9',
    elements: [
      {
        type: 'image',
        position: { x: 660, y: 150 },
        size: { width: 600, height: 400 },
        src: '',
        objectFit: 'contain',
      },
      {
        type: 'text',
        position: { x: 360, y: 600 },
        size: { width: 1200, height: 120 },
        content: 'Welcome',
        fontSize: 96,
        fontWeight: 'bold',
        color: '#1a1a1a',
        backgroundColor: 'transparent',
        textAlign: 'center',
        fontFamily: 'sans-serif',
      },
      {
        type: 'text',
        position: { x: 460, y: 740 },
        size: { width: 1000, height: 60 },
        content: 'We\'re glad to have you here',
        fontSize: 32,
        fontWeight: 'normal',
        color: '#666666',
        backgroundColor: 'transparent',
        textAlign: 'center',
        fontFamily: 'sans-serif',
      },
    ],
  },
  {
    id: 'menu-board',
    name: 'Restaurant Menu',
    description: 'Professional menu layout with categories',
    thumbnail: '/placeholder.svg',
    ratio: '16:9',
    elements: [
      {
        type: 'text',
        position: { x: 0, y: 0 },
        size: { width: 1920, height: 140 },
        content: '🍽️ Today\'s Menu',
        fontSize: 72,
        fontWeight: 'bold',
        color: '#ffffff',
        backgroundColor: '#1a1a1a',
        textAlign: 'center',
        fontFamily: 'sans-serif',
      },
      {
        type: 'text',
        position: { x: 50, y: 180 },
        size: { width: 580, height: 400 },
        content: '🥗 Starters\n\nCaesar Salad - $12\nSoup of the Day - $8\nBruschetta - $10',
        fontSize: 28,
        fontWeight: 'normal',
        color: '#333333',
        backgroundColor: '#f8f8f8',
        textAlign: 'left',
        fontFamily: 'sans-serif',
      },
      {
        type: 'text',
        position: { x: 670, y: 180 },
        size: { width: 580, height: 400 },
        content: '🍖 Main Courses\n\nGrilled Salmon - $28\nRibeye Steak - $36\nPasta Primavera - $22',
        fontSize: 28,
        fontWeight: 'normal',
        color: '#333333',
        backgroundColor: '#f8f8f8',
        textAlign: 'left',
        fontFamily: 'sans-serif',
      },
      {
        type: 'text',
        position: { x: 1290, y: 180 },
        size: { width: 580, height: 400 },
        content: '🍰 Desserts\n\nChocolate Cake - $10\nTiramisu - $12\nIce Cream - $8',
        fontSize: 28,
        fontWeight: 'normal',
        color: '#333333',
        backgroundColor: '#f8f8f8',
        textAlign: 'left',
        fontFamily: 'sans-serif',
      },
      {
        type: 'ticker',
        position: { x: 0, y: 1000 },
        size: { width: 1920, height: 80 },
        text: '⭐ Daily Special: Chef\'s Tasting Menu - $55 per person | Happy Hour: 4-6 PM - 50% off appetizers! ⭐',
        speed: 5,
        fontSize: 32,
        color: '#ffffff',
        backgroundColor: '#d97706',
      },
    ],
  },
  {
    id: 'promo-sale',
    name: 'Sale Promotion',
    description: 'Eye-catching sale announcement',
    thumbnail: '/placeholder.svg',
    ratio: '16:9',
    elements: [
      {
        type: 'text',
        position: { x: 0, y: 0 },
        size: { width: 1920, height: 1080 },
        content: '',
        fontSize: 24,
        fontWeight: 'normal',
        color: '#ffffff',
        backgroundColor: '#dc2626',
        textAlign: 'center',
        fontFamily: 'sans-serif',
      },
      {
        type: 'text',
        position: { x: 160, y: 200 },
        size: { width: 1600, height: 200 },
        content: '🔥 MEGA SALE 🔥',
        fontSize: 120,
        fontWeight: 'bold',
        color: '#ffffff',
        backgroundColor: 'transparent',
        textAlign: 'center',
        fontFamily: 'sans-serif',
      },
      {
        type: 'text',
        position: { x: 360, y: 420 },
        size: { width: 1200, height: 250 },
        content: 'UP TO 70% OFF',
        fontSize: 140,
        fontWeight: 'bold',
        color: '#fef08a',
        backgroundColor: 'transparent',
        textAlign: 'center',
        fontFamily: 'sans-serif',
      },
      {
        type: 'text',
        position: { x: 460, y: 700 },
        size: { width: 1000, height: 80 },
        content: 'Limited Time Only • While Supplies Last',
        fontSize: 36,
        fontWeight: 'normal',
        color: '#ffffff',
        backgroundColor: 'transparent',
        textAlign: 'center',
        fontFamily: 'sans-serif',
      },
      {
        type: 'ticker',
        position: { x: 0, y: 980 },
        size: { width: 1920, height: 100 },
        text: '🛍️ SHOP NOW AND SAVE BIG! • FREE SHIPPING ON ORDERS OVER $50 • USE CODE: SAVE20 FOR EXTRA 20% OFF 🛍️',
        speed: 4,
        fontSize: 36,
        color: '#dc2626',
        backgroundColor: '#ffffff',
      },
    ],
  },
  {
    id: 'corporate-lobby',
    name: 'Corporate Lobby',
    description: 'Professional corporate display',
    thumbnail: '/placeholder.svg',
    ratio: '16:9',
    elements: [
      {
        type: 'image',
        position: { x: 60, y: 40 },
        size: { width: 300, height: 150 },
        src: '',
        objectFit: 'contain',
      },
      {
        type: 'text',
        position: { x: 60, y: 250 },
        size: { width: 900, height: 120 },
        content: 'Welcome to Our Office',
        fontSize: 64,
        fontWeight: 'bold',
        color: '#1e3a5f',
        backgroundColor: 'transparent',
        textAlign: 'left',
        fontFamily: 'sans-serif',
      },
      {
        type: 'text',
        position: { x: 60, y: 400 },
        size: { width: 800, height: 300 },
        content: 'Building Hours\n\nMonday - Friday: 8:00 AM - 6:00 PM\nSaturday: 9:00 AM - 1:00 PM\nSunday: Closed',
        fontSize: 28,
        fontWeight: 'normal',
        color: '#333333',
        backgroundColor: '#f1f5f9',
        textAlign: 'left',
        fontFamily: 'sans-serif',
      },
      {
        type: 'slideshow',
        position: { x: 1000, y: 200 },
        size: { width: 860, height: 580 },
        images: [],
        transition: 'fade',
        autoPlay: true,
      },
      {
        type: 'ticker',
        position: { x: 0, y: 1000 },
        size: { width: 1920, height: 80 },
        text: '📢 Company Announcement: Town Hall Meeting this Friday at 3 PM in the Main Conference Room • New parking policy effective next month',
        speed: 5,
        fontSize: 28,
        color: '#ffffff',
        backgroundColor: '#1e3a5f',
      },
    ],
  },
  {
    id: 'event-schedule',
    name: 'Event Schedule',
    description: 'Conference or event schedule display',
    thumbnail: '/placeholder.svg',
    ratio: '16:9',
    elements: [
      {
        type: 'text',
        position: { x: 0, y: 0 },
        size: { width: 1920, height: 160 },
        content: '📅 Today\'s Schedule',
        fontSize: 72,
        fontWeight: 'bold',
        color: '#ffffff',
        backgroundColor: '#7c3aed',
        textAlign: 'center',
        fontFamily: 'sans-serif',
      },
      {
        type: 'text',
        position: { x: 100, y: 200 },
        size: { width: 820, height: 120 },
        content: '9:00 AM - Registration & Coffee',
        fontSize: 36,
        fontWeight: 'normal',
        color: '#1a1a1a',
        backgroundColor: '#f3f4f6',
        textAlign: 'left',
        fontFamily: 'sans-serif',
      },
      {
        type: 'text',
        position: { x: 100, y: 340 },
        size: { width: 820, height: 120 },
        content: '10:00 AM - Keynote Speech',
        fontSize: 36,
        fontWeight: 'bold',
        color: '#ffffff',
        backgroundColor: '#7c3aed',
        textAlign: 'left',
        fontFamily: 'sans-serif',
      },
      {
        type: 'text',
        position: { x: 100, y: 480 },
        size: { width: 820, height: 120 },
        content: '12:00 PM - Lunch Break',
        fontSize: 36,
        fontWeight: 'normal',
        color: '#1a1a1a',
        backgroundColor: '#f3f4f6',
        textAlign: 'left',
        fontFamily: 'sans-serif',
      },
      {
        type: 'text',
        position: { x: 100, y: 620 },
        size: { width: 820, height: 120 },
        content: '2:00 PM - Workshop Sessions',
        fontSize: 36,
        fontWeight: 'normal',
        color: '#1a1a1a',
        backgroundColor: '#f3f4f6',
        textAlign: 'left',
        fontFamily: 'sans-serif',
      },
      {
        type: 'image',
        position: { x: 1000, y: 200 },
        size: { width: 820, height: 540 },
        src: '',
        objectFit: 'cover',
      },
      {
        type: 'text',
        position: { x: 1000, y: 760 },
        size: { width: 820, height: 80 },
        content: 'Room: Grand Ballroom A',
        fontSize: 32,
        fontWeight: 'normal',
        color: '#666666',
        backgroundColor: 'transparent',
        textAlign: 'center',
        fontFamily: 'sans-serif',
      },
    ],
  },
  // Portrait 9:16 Templates
  {
    id: 'portrait-social',
    name: 'Social Media Style',
    description: 'Vertical social media inspired layout',
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
        fontSize: 56,
        fontWeight: 'bold',
        color: '#1a1a1a',
        backgroundColor: 'transparent',
        textAlign: 'center',
        fontFamily: 'sans-serif',
      },
      {
        type: 'text',
        position: { x: 50, y: 1480 },
        size: { width: 980, height: 100 },
        content: '#YourBrand #FollowUs',
        fontSize: 36,
        fontWeight: 'normal',
        color: '#666666',
        backgroundColor: 'transparent',
        textAlign: 'center',
        fontFamily: 'sans-serif',
      },
      {
        type: 'ticker',
        position: { x: 0, y: 1820 },
        size: { width: 1080, height: 100 },
        text: '💫 Like • Comment • Share • Tag a Friend 💫',
        speed: 4,
        fontSize: 32,
        color: '#ffffff',
        backgroundColor: '#e11d48',
      },
    ],
  },
  {
    id: 'portrait-retail',
    name: 'Retail Display',
    description: 'Vertical retail product showcase',
    thumbnail: '/placeholder.svg',
    ratio: '9:16',
    elements: [
      {
        type: 'text',
        position: { x: 0, y: 0 },
        size: { width: 1080, height: 200 },
        content: 'NEW ARRIVAL',
        fontSize: 72,
        fontWeight: 'bold',
        color: '#ffffff',
        backgroundColor: '#000000',
        textAlign: 'center',
        fontFamily: 'sans-serif',
      },
      {
        type: 'image',
        position: { x: 40, y: 240 },
        size: { width: 1000, height: 900 },
        src: '',
        objectFit: 'cover',
      },
      {
        type: 'text',
        position: { x: 40, y: 1180 },
        size: { width: 1000, height: 100 },
        content: 'Premium Collection',
        fontSize: 48,
        fontWeight: 'bold',
        color: '#1a1a1a',
        backgroundColor: 'transparent',
        textAlign: 'center',
        fontFamily: 'sans-serif',
      },
      {
        type: 'text',
        position: { x: 40, y: 1300 },
        size: { width: 1000, height: 140 },
        content: '$199.99',
        fontSize: 96,
        fontWeight: 'bold',
        color: '#dc2626',
        backgroundColor: 'transparent',
        textAlign: 'center',
        fontFamily: 'sans-serif',
      },
      {
        type: 'text',
        position: { x: 140, y: 1480 },
        size: { width: 800, height: 120 },
        content: 'Available Now',
        fontSize: 40,
        fontWeight: 'bold',
        color: '#ffffff',
        backgroundColor: '#22c55e',
        textAlign: 'center',
        fontFamily: 'sans-serif',
      },
      {
        type: 'ticker',
        position: { x: 0, y: 1820 },
        size: { width: 1080, height: 100 },
        text: '🏷️ FREE SHIPPING ON ALL ORDERS • USE CODE: NEWCUST FOR 15% OFF 🏷️',
        speed: 5,
        fontSize: 28,
        color: '#000000',
        backgroundColor: '#fef08a',
      },
    ],
  },
  // Square 1:1 Templates
  {
    id: 'square-promo',
    name: 'Square Promotion',
    description: 'Balanced square promotional layout',
    thumbnail: '/placeholder.svg',
    ratio: '1:1',
    elements: [
      {
        type: 'image',
        position: { x: 0, y: 0 },
        size: { width: 1080, height: 600 },
        src: '',
        objectFit: 'cover',
      },
      {
        type: 'text',
        position: { x: 40, y: 640 },
        size: { width: 1000, height: 100 },
        content: 'Special Offer',
        fontSize: 56,
        fontWeight: 'bold',
        color: '#1a1a1a',
        backgroundColor: 'transparent',
        textAlign: 'center',
        fontFamily: 'sans-serif',
      },
      {
        type: 'text',
        position: { x: 140, y: 760 },
        size: { width: 800, height: 100 },
        content: 'Buy One Get One Free',
        fontSize: 40,
        fontWeight: 'normal',
        color: '#666666',
        backgroundColor: 'transparent',
        textAlign: 'center',
        fontFamily: 'sans-serif',
      },
      {
        type: 'text',
        position: { x: 240, y: 900 },
        size: { width: 600, height: 80 },
        content: 'Shop Now →',
        fontSize: 32,
        fontWeight: 'bold',
        color: '#ffffff',
        backgroundColor: '#2563eb',
        textAlign: 'center',
        fontFamily: 'sans-serif',
      },
    ],
  },
  {
    id: 'square-info',
    name: 'Info Display',
    description: 'Clean information kiosk layout',
    thumbnail: '/placeholder.svg',
    ratio: '1:1',
    elements: [
      {
        type: 'text',
        position: { x: 0, y: 0 },
        size: { width: 1080, height: 160 },
        content: 'ℹ️ Information',
        fontSize: 56,
        fontWeight: 'bold',
        color: '#ffffff',
        backgroundColor: '#0ea5e9',
        textAlign: 'center',
        fontFamily: 'sans-serif',
      },
      {
        type: 'text',
        position: { x: 60, y: 200 },
        size: { width: 960, height: 350 },
        content: '📍 Location\nMain Building, Floor 2\n\n⏰ Hours\nOpen 9 AM - 5 PM Daily\n\n📞 Contact\n(555) 123-4567',
        fontSize: 32,
        fontWeight: 'normal',
        color: '#333333',
        backgroundColor: '#f8fafc',
        textAlign: 'left',
        fontFamily: 'sans-serif',
      },
      {
        type: 'slideshow',
        position: { x: 60, y: 580 },
        size: { width: 960, height: 440 },
        images: [],
        transition: 'slide',
        autoPlay: true,
      },
    ],
  },
  // Blank Templates
  {
    id: 'blank-landscape',
    name: 'Blank Landscape',
    description: 'Start from scratch (16:9)',
    thumbnail: '/placeholder.svg',
    ratio: '16:9',
    elements: [],
  },
  {
    id: 'blank-portrait',
    name: 'Blank Portrait',
    description: 'Start from scratch (9:16)',
    thumbnail: '/placeholder.svg',
    ratio: '9:16',
    elements: [],
  },
  {
    id: 'blank-square',
    name: 'Blank Square',
    description: 'Start from scratch (1:1)',
    thumbnail: '/placeholder.svg',
    ratio: '1:1',
    elements: [],
  },
];

const categoryIcons = {
  all: Monitor,
  landscape: Monitor,
  portrait: Smartphone,
  square: Square,
};

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

  const landscapeTemplates = templates.filter(t => t.ratio === '16:9');
  const portraitTemplates = templates.filter(t => t.ratio === '9:16');
  const squareTemplates = templates.filter(t => t.ratio === '1:1');

  const TemplateCard = ({ template }: { template: Template }) => (
    <Card 
      className="cursor-pointer hover:ring-2 hover:ring-primary hover:shadow-lg transition-all group overflow-hidden"
      onClick={() => handleSelect(template)}
    >
      <CardContent className="p-0">
        <div 
          className={`relative bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center text-muted-foreground ${
            template.ratio === '16:9' ? 'aspect-video' : 
            template.ratio === '9:16' ? 'aspect-[9/16] max-h-48' : 
            'aspect-square'
          }`}
        >
          <div className="text-center p-4">
            <Badge variant="secondary" className="mb-2">{template.ratio}</Badge>
            {template.elements.length === 0 ? (
              <p className="text-sm">Blank Canvas</p>
            ) : (
              <p className="text-xs">{template.elements.length} elements</p>
            )}
          </div>
          <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 transition-colors" />
        </div>
        <div className="p-3">
          <h3 className="font-medium text-sm truncate">{template.name}</h3>
          <p className="text-xs text-muted-foreground truncate">{template.description}</p>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="text-xl">Choose a Template</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-4">
            <TabsTrigger value="all" className="gap-2">
              <Monitor className="h-4 w-4" />
              All
            </TabsTrigger>
            <TabsTrigger value="landscape" className="gap-2">
              <Monitor className="h-4 w-4" />
              Landscape
            </TabsTrigger>
            <TabsTrigger value="portrait" className="gap-2">
              <Smartphone className="h-4 w-4" />
              Portrait
            </TabsTrigger>
            <TabsTrigger value="square" className="gap-2">
              <Square className="h-4 w-4" />
              Square
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[60vh]">
            <TabsContent value="all" className="mt-0">
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                    <Monitor className="h-4 w-4" /> Landscape (16:9)
                  </h4>
                  <div className="grid grid-cols-3 gap-4">
                    {landscapeTemplates.map((template) => (
                      <TemplateCard key={template.id} template={template} />
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                    <Smartphone className="h-4 w-4" /> Portrait (9:16)
                  </h4>
                  <div className="grid grid-cols-4 gap-4">
                    {portraitTemplates.map((template) => (
                      <TemplateCard key={template.id} template={template} />
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                    <Square className="h-4 w-4" /> Square (1:1)
                  </h4>
                  <div className="grid grid-cols-3 gap-4">
                    {squareTemplates.map((template) => (
                      <TemplateCard key={template.id} template={template} />
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="landscape" className="mt-0">
              <div className="grid grid-cols-3 gap-4">
                {landscapeTemplates.map((template) => (
                  <TemplateCard key={template.id} template={template} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="portrait" className="mt-0">
              <div className="grid grid-cols-4 gap-4">
                {portraitTemplates.map((template) => (
                  <TemplateCard key={template.id} template={template} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="square" className="mt-0">
              <div className="grid grid-cols-3 gap-4">
                {squareTemplates.map((template) => (
                  <TemplateCard key={template.id} template={template} />
                ))}
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
