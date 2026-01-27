# SignageHub - Digital Signage Management System

A modern, web-based digital signage solution for creating, managing, and displaying dynamic content on screens, kiosks, and digital displays.

![SignageHub](https://img.shields.io/badge/SignageHub-Digital%20Signage-teal)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Technology Stack](#technology-stack)
- [Architecture](#architecture)
- [Database Schema](#database-schema)
- [Storage System](#storage-system)
- [Application Routes](#application-routes)
- [Features Breakdown](#features-breakdown)
- [Display/Player System](#displayplayer-system)
- [Publishing Workflow](#publishing-workflow)
- [Component Structure](#component-structure)
- [Getting Started](#getting-started)

---

## 🎯 Overview

SignageHub is a complete digital signage solution that allows users to:
- Design custom signage layouts with drag-and-drop functionality
- Add various media elements (images, videos, text, tickers, slideshows)
- Preview designs in real-time
- Publish designs with unique codes for display on any screen
- Load published displays on TVs, kiosks, or browsers using simple codes

---

## 🛠 Technology Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| **React 18** | UI framework for building interactive interfaces |
| **TypeScript** | Type-safe JavaScript for better developer experience |
| **Vite** | Fast build tool and development server |
| **Tailwind CSS** | Utility-first CSS framework for styling |
| **shadcn/ui** | Pre-built accessible UI components |
| **React Router DOM** | Client-side routing |
| **@dnd-kit** | Drag and drop functionality |
| **Lucide React** | Icon library |
| **Sonner** | Toast notifications |

### Backend (Lovable Cloud / Supabase)
| Technology | Purpose |
|------------|---------|
| **Supabase** | Backend-as-a-Service (BaaS) |
| **PostgreSQL** | Relational database |
| **Supabase Storage** | File/media storage |
| **Row Level Security (RLS)** | Database security policies |

### State Management
| Technology | Purpose |
|------------|---------|
| **TanStack React Query** | Server state management and caching |
| **React Hooks** | Local component state |

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend (React + Vite)                  │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐   │
│  │ Landing Page │  │ Admin Editor │  │ Display/Player Page  │   │
│  │     (/)      │  │   (/admin)   │  │   (/display/:id)     │   │
│  └──────────────┘  └──────────────┘  └──────────────────────┘   │
├─────────────────────────────────────────────────────────────────┤
│                    Supabase Client SDK                           │
├─────────────────────────────────────────────────────────────────┤
│  ┌────────────────────┐  ┌────────────────────────────────┐     │
│  │  PostgreSQL DB     │  │  Supabase Storage              │     │
│  │  (signage_projects)│  │  (signage-media bucket)        │     │
│  └────────────────────┘  └────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────────┘
```

---

## 💾 Database Schema

### Table: `signage_projects`

Stores all signage project data including layout elements as JSONB.

```sql
CREATE TABLE public.signage_projects (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL DEFAULT 'Untitled Project',
  ratio           TEXT NOT NULL DEFAULT '16:9',
  canvas_width    INTEGER NOT NULL DEFAULT 1920,
  canvas_height   INTEGER NOT NULL DEFAULT 1080,
  elements        JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_published    BOOLEAN NOT NULL DEFAULT false,
  publish_code    TEXT UNIQUE,           -- 6-character code for loading display
  published_at    TIMESTAMP WITH TIME ZONE,
  created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
```

### Elements JSONB Structure

The `elements` field stores an array of canvas elements. Each element has a specific structure based on its type:

```typescript
// Base element structure
interface BaseElement {
  id: string;           // Unique identifier (UUID)
  type: string;         // Element type
  position: {
    x: number;          // X position in pixels
    y: number;          // Y position in pixels
  };
  size: {
    width: number;      // Width in pixels
    height: number;     // Height in pixels
  };
  zIndex: number;       // Layer order
}

// Image Element
interface ImageElement extends BaseElement {
  type: 'image';
  src: string;          // Image URL (from storage)
  alt?: string;         // Alt text
  objectFit: 'cover' | 'contain' | 'fill' | 'none';
}

// Video Element
interface VideoElement extends BaseElement {
  type: 'video';
  src: string;          // Video URL
  autoPlay: boolean;
  loop: boolean;
  muted: boolean;
}

// Text Element
interface TextElement extends BaseElement {
  type: 'text';
  content: string;      // Text content
  fontSize: number;     // Font size in pixels
  fontWeight: string;   // Font weight (normal, bold, etc.)
  fontFamily: string;   // Font family
  color: string;        // Text color
  backgroundColor: string;
  textAlign: 'left' | 'center' | 'right';
}

// Ticker Element (Scrolling text)
interface TickerElement extends BaseElement {
  type: 'ticker';
  text: string;         // Ticker text
  speed: number;        // Scroll speed (1-10)
  fontSize: number;
  color: string;
  backgroundColor: string;
}

// Slideshow Element
interface SlideshowElement extends BaseElement {
  type: 'slideshow';
  images: Array<{
    src: string;        // Image URL
    duration: number;   // Display duration in seconds
  }>;
  transition: 'fade' | 'slide';
  autoPlay: boolean;
}
```

### Example Elements Data

```json
[
  {
    "id": "elem-1",
    "type": "image",
    "position": { "x": 0, "y": 0 },
    "size": { "width": 1920, "height": 1080 },
    "zIndex": 1,
    "src": "https://storage.url/image.jpg",
    "objectFit": "cover"
  },
  {
    "id": "elem-2",
    "type": "text",
    "position": { "x": 100, "y": 100 },
    "size": { "width": 500, "height": 100 },
    "zIndex": 2,
    "content": "Welcome!",
    "fontSize": 48,
    "fontWeight": "bold",
    "color": "#ffffff",
    "backgroundColor": "transparent",
    "textAlign": "center"
  }
]
```

### Row Level Security (RLS) Policies

```sql
-- Anyone can view all projects (for admin panel)
CREATE POLICY "Anyone can view all projects" 
  ON signage_projects FOR SELECT 
  USING (true);

-- Anyone can view published projects by code
CREATE POLICY "Anyone can view by publish code" 
  ON signage_projects FOR SELECT 
  USING (publish_code IS NOT NULL AND is_published = true);

-- Anyone can create projects
CREATE POLICY "Anyone can create projects" 
  ON signage_projects FOR INSERT 
  WITH CHECK (true);

-- Anyone can update projects
CREATE POLICY "Anyone can update projects" 
  ON signage_projects FOR UPDATE 
  USING (true);
```

---

## 📁 Storage System

### Bucket: `signage-media`

All uploaded media files (images, videos) are stored in Supabase Storage.

| Property | Value |
|----------|-------|
| Bucket Name | `signage-media` |
| Public Access | Yes |
| File Types | Images (jpg, png, gif, webp), Videos (mp4, webm) |

### Upload Flow

```
User selects file → Upload to signage-media bucket → Get public URL → Store URL in elements JSONB
```

### File URL Structure

```
https://<project-id>.supabase.co/storage/v1/object/public/signage-media/<filename>
```

---

## 🛤 Application Routes

| Route | Component | Purpose |
|-------|-----------|---------|
| `/` | `Index.tsx` | Landing page with display code input |
| `/admin` | `Editor.tsx` | Main editor for creating/editing signage |
| `/display/:id` | `Display.tsx` | Fullscreen display renderer |

---

## ✨ Features Breakdown

### 1. Landing Page (`/`)

- Modern monitor mockup design with teal/cyan theme
- 6-character code input for loading displays
- Validates code against database
- Redirects to display page on valid code
- Animated background elements

### 2. Admin Editor (`/admin`)

#### Layout Structure
```
┌─────────────────────────────────────────────────────────────────┐
│                         Toolbar                                  │
├──────────────┬───────────────────────────┬──────────────────────┤
│              │                           │                      │
│   Media      │       Design Canvas       │   Properties Panel   │
│   Sidebar    │       (Drag & Drop)       │   ───────────────    │
│              │                           │   Live Preview       │
│              │                           │                      │
└──────────────┴───────────────────────────┴──────────────────────┘
```

#### Components

| Component | File | Purpose |
|-----------|------|---------|
| MediaSidebar | `MediaSidebar.tsx` | Draggable media elements library |
| DesignCanvas | `DesignCanvas.tsx` | Main canvas with zoom controls |
| DroppableCanvas | `DroppableCanvas.tsx` | Drop zone with visual indicators |
| CanvasElement | `CanvasElement.tsx` | Individual element renderer |
| PropertyPanel | `PropertyPanel.tsx` | Element property editor |
| LivePreview | `LivePreview.tsx` | Real-time preview panel |
| EditorToolbar | `EditorToolbar.tsx` | Save, publish, settings |
| PublishModal | `PublishModal.tsx` | Publish dialog with code/URL |

#### Canvas Features

- **Drag & Drop**: Add elements from sidebar to canvas
- **Resize**: Drag element corners to resize
- **Move**: Drag elements to reposition
- **Select**: Click to select and edit properties
- **Zoom**: 50% - 150% zoom controls
- **Aspect Ratios**: 16:9, 4:3, 9:16, 1:1

### 3. Display/Player (`/display/:id`)

Renders published signage in fullscreen with:
- Responsive scaling to fit screen
- Auto-playing videos and slideshows
- Animated text tickers
- Smooth fade-in transitions on load
- Staggered element animations

---

## 🖥 Display/Player System

### How Display Loading Works

```
1. User enters 6-character code on landing page
   ↓
2. Query database: SELECT * FROM signage_projects WHERE publish_code = 'ABC123' AND is_published = true
   ↓
3. Redirect to /display/{project_id}
   ↓
4. Display page loads project by ID
   ↓
5. Parse elements JSONB and render each element
   ↓
6. Apply responsive scaling based on aspect ratio
   ↓
7. Apply fade-in animations with staggered delays
```

### Element Rendering Logic

```typescript
// Position calculation for responsive display
const style = {
  position: 'absolute',
  left: `${(element.position.x / canvasWidth) * 100}%`,
  top: `${(element.position.y / canvasHeight) * 100}%`,
  width: `${(element.size.width / canvasWidth) * 100}%`,
  height: `${(element.size.height / canvasHeight) * 100}%`,
  zIndex: element.zIndex,
};
```

### Slideshow Animation

```typescript
// Auto-advance slides based on duration
useEffect(() => {
  if (!autoPlay || images.length <= 1) return;
  
  const duration = images[currentIndex].duration * 1000;
  const timer = setTimeout(() => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  }, duration);
  
  return () => clearTimeout(timer);
}, [currentIndex, images, autoPlay]);
```

### Ticker Animation (CSS)

```css
@keyframes marquee {
  0% { transform: translateX(100%); }
  100% { transform: translateX(-100%); }
}

.ticker {
  animation: marquee 15s linear infinite;
}
```

---

## 📤 Publishing Workflow

```
┌─────────────────┐
│  Click Publish  │
└────────┬────────┘
         ↓
┌─────────────────────────────┐
│ Generate unique 6-char code │
│ (if not already generated)  │
└────────────┬────────────────┘
         ↓
┌─────────────────────────────┐
│ Update database:            │
│ - is_published = true       │
│ - publish_code = 'ABC123'   │
│ - published_at = now()      │
└────────────┬────────────────┘
         ↓
┌─────────────────────────────┐
│ Show PublishModal with:     │
│ - Direct URL                │
│ - 6-character code          │
│ - Copy buttons              │
└─────────────────────────────┘
```

### Code Generation

```typescript
const generateCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};
```

---

## 📂 Component Structure

```
src/
├── components/
│   ├── signage/
│   │   ├── CanvasElement.tsx      # Renders individual canvas elements
│   │   ├── DesignCanvas.tsx       # Main canvas with zoom/pan
│   │   ├── DraggableMediaItem.tsx # Sidebar draggable items
│   │   ├── DroppableCanvas.tsx    # Drop zone wrapper
│   │   ├── EditorToolbar.tsx      # Top toolbar (save, publish)
│   │   ├── ImageCropPanel.tsx     # Image cropping controls
│   │   ├── LivePreview.tsx        # Real-time preview panel
│   │   ├── MediaSidebar.tsx       # Left sidebar with elements
│   │   ├── PropertyPanel.tsx      # Right panel for properties
│   │   ├── PublishModal.tsx       # Publish dialog
│   │   ├── RatioSelector.tsx      # Aspect ratio picker
│   │   ├── SlideshowPanel.tsx     # Slideshow editor
│   │   └── TemplatesDialog.tsx    # Template selector
│   └── ui/                        # shadcn/ui components
├── hooks/
│   ├── useSignageProject.ts       # Project CRUD operations
│   └── useImageUpload.ts          # Image upload handling
├── pages/
│   ├── Index.tsx                  # Landing page
│   ├── Editor.tsx                 # Admin editor
│   ├── Display.tsx                # Fullscreen player
│   └── NotFound.tsx               # 404 page
├── types/
│   └── signage.ts                 # TypeScript type definitions
└── integrations/
    └── supabase/
        ├── client.ts              # Supabase client instance
        └── types.ts               # Auto-generated DB types
```

---

## 🎨 Design System

### Color Palette (Teal/Cyan Theme)

```css
:root {
  --primary: 175 70% 40%;        /* Teal primary */
  --accent: 185 75% 45%;         /* Cyan accent */
  --background: 180 20% 99%;     /* Light background */
  --foreground: 185 80% 10%;     /* Dark text */
  --muted: 180 20% 94%;          /* Muted backgrounds */
  --border: 180 20% 88%;         /* Border color */
}

.dark {
  --primary: 175 70% 45%;        /* Teal primary */
  --accent: 185 75% 50%;         /* Cyan accent */
  --background: 185 50% 6%;      /* Dark background */
  --foreground: 180 30% 95%;     /* Light text */
}
```

---

## 🚀 Getting Started

### Local Development

```sh
# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate to project directory
cd <YOUR_PROJECT_NAME>

# Install dependencies
npm install

# Start development server
npm run dev
```

### Using the Application

1. **Access the Editor**
   - Navigate to `/admin` to open the design editor

2. **Create a Design**
   - Drag elements from the sidebar to the canvas
   - Customize properties in the right panel
   - Preview in real-time

3. **Publish**
   - Click "Publish" in the toolbar
   - Copy the generated code or URL

4. **Display**
   - Go to the landing page (`/`)
   - Enter the 6-character code
   - View your design in fullscreen

---

## 🔧 Configuration

### Environment Variables

The following environment variables are automatically configured:

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase anon key |
| `VITE_SUPABASE_PROJECT_ID` | Supabase project ID |

---

## 📝 License

This project is built with [Lovable](https://lovable.dev).
