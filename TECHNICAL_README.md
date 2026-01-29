# Digital Signage Builder - Technical Documentation

## Table of Contents
1. [Project Overview](#1-project-overview)
2. [System Architecture](#2-system-architecture)
3. [Technology Stack](#3-technology-stack)
4. [Database Design](#4-database-design)
5. [API & Route Documentation](#5-api--route-documentation)
6. [Business Logic Flow](#6-business-logic-flow)
7. [View & UI Rendering Logic](#7-view--ui-rendering-logic)
8. [Authentication, Roles & Permissions](#8-authentication-roles--permissions)
9. [Important Code Snippets](#9-important-code-snippets)
10. [Configuration & Environment Setup](#10-configuration--environment-setup)
11. [How to Run the Project Locally](#11-how-to-run-the-project-locally)
12. [Error Handling & Logging](#12-error-handling--logging)
13. [Future Scalability & Extension Points](#13-future-scalability--extension-points)
14. [Developer Notes & Best Practices](#14-developer-notes--best-practices)
15. [Self-Hosted Deployment](#15-self-hosted-deployment)

---

## 1. Project Overview

### High-Level Explanation
Digital Signage Builder is a web-based visual editor that allows users to create, design, and publish digital signage content for displays such as Smart TVs, kiosks, and web browsers. The application provides a drag-and-drop canvas interface where users can compose layouts with various media elements.

### Problem It Solves
- Eliminates the need for specialized software to create digital signage content
- Provides a browser-based solution accessible from any device
- Enables instant publishing with shareable codes for easy display deployment
- Supports multiple aspect ratios for different display types

### Target Users
- Marketing teams creating promotional displays
- Retail businesses managing in-store signage
- Corporate offices displaying announcements
- Hospitality venues showing menus and information
- Event organizers creating event displays

### Core Features
- **Drag-and-Drop Editor**: Visual canvas with resizable panels for media, design, and properties
- **Multiple Element Types**: Images, videos, text overlays, scrolling tickers, and slideshows
- **Aspect Ratio Support**: 16:9 (landscape), 9:16 (portrait), 1:1 (square), 4:3 (standard)
- **Real-time Preview**: Modal-based live preview showing exact display output
- **Project Management**: Create, edit, duplicate, and delete projects
- **Publishing System**: Generate unique 6-character codes for public display access
- **Template System**: Pre-built layouts for quick project creation
- **Cloud Storage**: Media file uploads stored in cloud storage buckets

---

## 2. System Architecture

### Overall Architecture
The application follows a **component-based SPA (Single Page Application)** architecture with a cloud backend:

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (React SPA)                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │   Pages     │  │  Components │  │       Hooks         │ │
│  │  (Routes)   │  │   (UI/UX)   │  │  (State & Logic)    │ │
│  └─────────────┘  └─────────────┘  └─────────────────────┘ │
└────────────────────────────┬────────────────────────────────┘
                             │ HTTPS / Supabase Client SDK
┌────────────────────────────▼────────────────────────────────┐
│                     Lovable Cloud (Supabase)                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │  PostgreSQL │  │   Storage   │  │   Authentication    │ │
│  │  Database   │  │   Buckets   │  │     (Supabase)      │ │
│  └─────────────┘  └─────────────┘  └─────────────────────┘ │
│  ┌─────────────────────────────────────────────────────────┐│
│  │              RPC Functions (Security Layer)              ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

### Frontend-Backend Communication
1. **Supabase Client SDK** handles all communication with the backend
2. **Row-Level Security (RLS)** enforces data access at the database level
3. **RPC Functions** provide secure access to public data without exposing enumerable endpoints
4. **Real-time Subscriptions** available for future live updates (not currently implemented)

### Folder/Module Structure

```
src/
├── components/
│   ├── auth/
│   │   └── ProtectedRoute.tsx       # Route guard for authenticated pages
│   ├── signage/
│   │   ├── CanvasElement.tsx        # Individual element renderer on canvas
│   │   ├── DesignCanvas.tsx         # Main canvas workspace
│   │   ├── DraggableMediaItem.tsx   # Sidebar draggable items
│   │   ├── DroppableCanvas.tsx      # Drop zone wrapper
│   │   ├── EditorToolbar.tsx        # Top toolbar with actions
│   │   ├── ImageCropPanel.tsx       # Image cropping controls
│   │   ├── LivePreview.tsx          # Preview renderer
│   │   ├── MediaSidebar.tsx         # Left sidebar media palette
│   │   ├── PreviewModal.tsx         # Preview modal wrapper
│   │   ├── PropertyPanel.tsx        # Right sidebar properties
│   │   ├── PublishModal.tsx         # Publish confirmation modal
│   │   ├── RatioSelector.tsx        # Aspect ratio picker
│   │   ├── SlideshowPanel.tsx       # Slideshow configuration
│   │   └── TemplatesDialog.tsx      # Template selection dialog
│   └── ui/                          # shadcn/ui component library
├── hooks/
│   ├── useAuth.ts                   # Authentication state & actions
│   ├── useImageUpload.ts            # File upload logic
│   ├── useMobile.tsx                # Responsive breakpoint detection
│   ├── useSignageProject.ts         # Project state management
│   └── useToast.ts                  # Toast notifications
├── integrations/
│   └── supabase/
│       ├── client.ts                # Supabase client instance
│       └── types.ts                 # Auto-generated TypeScript types
├── lib/
│   ├── auth/                        # Authentication abstraction layer
│   │   ├── index.ts                 # Auth adapter export
│   │   ├── types.ts                 # Auth type definitions
│   │   └── supabase-adapter.ts      # Supabase auth implementation
│   ├── database/                    # Database abstraction layer
│   │   ├── index.ts                 # Database adapter export
│   │   ├── types.ts                 # Database type definitions
│   │   └── supabase-adapter.ts      # Supabase database implementation
│   ├── storage/                     # Storage abstraction layer
│   │   ├── index.ts                 # Storage adapter export
│   │   ├── types.ts                 # Storage type definitions
│   │   └── supabase-adapter.ts      # Supabase storage implementation
│   ├── config.ts                    # Environment configuration
│   ├── ticker.ts                    # Ticker animation utilities
│   └── utils.ts                     # Utility functions (cn, etc.)
├── pages/
│   ├── Auth.tsx                     # Login/Signup page
│   ├── Display.tsx                  # Public display player
│   ├── Editor.tsx                   # Main editor page
│   ├── Index.tsx                    # Landing page
│   ├── NotFound.tsx                 # 404 page
│   └── Projects.tsx                 # Project management list
├── types/
│   └── signage.ts                   # Domain type definitions
├── App.tsx                          # Root component with routes
├── main.tsx                         # Application entry point
└── index.css                        # Global styles & design tokens

docs/
├── query.md                         # PostgreSQL schema for self-hosting
└── SELF_HOSTED_SETUP.md             # VPS deployment guide

supabase/
├── config.toml                      # Supabase configuration
└── migrations/                      # Database migration files
```

---

## 3. Technology Stack

### Frontend Framework
| Technology | Version | Purpose |
|------------|---------|---------|
| React | ^18.3.1 | UI component library |
| TypeScript | - | Static type checking |
| Vite | - | Build tool & dev server |
| React Router DOM | ^6.30.1 | Client-side routing |

### Styling & UI
| Technology | Version | Purpose |
|------------|---------|---------|
| Tailwind CSS | - | Utility-first CSS framework |
| shadcn/ui | - | Pre-built component library |
| Lucide React | ^0.462.0 | Icon library |
| tailwindcss-animate | ^1.0.7 | Animation utilities |

### State Management & Data Fetching
| Technology | Version | Purpose |
|------------|---------|---------|
| TanStack Query | ^5.83.0 | Server state management |
| React Hook Form | ^7.61.1 | Form state management |
| Zod | ^3.25.76 | Schema validation |

### Drag & Drop
| Technology | Version | Purpose |
|------------|---------|---------|
| @dnd-kit/core | ^6.3.1 | Drag-and-drop primitives |
| @dnd-kit/utilities | ^3.2.2 | DnD utility functions |

### Backend (Configurable Providers)

The application supports multiple backend providers configured via environment variables:

| Provider Type | Options | Default |
|---------------|---------|---------|
| Database | `supabase`, `postgres` | `supabase` |
| Authentication | `supabase`, `local` (JWT) | `supabase` |
| Storage | `supabase`, `local`, `s3` | `supabase` |

#### Lovable Cloud / Supabase (Default)
| Component | Purpose |
|-----------|---------|
| PostgreSQL | Relational database |
| Supabase Auth | User authentication |
| Supabase Storage | File/media storage |
| RPC Functions | Secure data access |
| Row-Level Security | Data authorization |

#### Self-Hosted (Local PostgreSQL)
| Component | Purpose |
|-----------|---------|
| PostgreSQL | Direct database connection |
| JWT + bcrypt | Local authentication |
| Local FS / MinIO | File storage |
| Application-level | Data authorization |

### Why This Stack Was Chosen
- **React + Vite**: Fast development with HMR and optimized production builds
- **Tailwind + shadcn/ui**: Rapid UI development with consistent design system
- **Supabase**: Integrated backend without server management, includes auth, storage, and real-time capabilities
- **@dnd-kit**: Modern, accessible drag-and-drop with excellent React integration
- **TypeScript**: Type safety across the entire codebase, including database types

---

## 4. Database Design

### Table: `signage_projects`

**Purpose**: Stores all signage project data including canvas configuration, element positions, and publication status.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | No | `gen_random_uuid()` | Primary key |
| `user_id` | UUID | No | - | Owner reference (FK to auth.users) |
| `name` | TEXT | No | `'Untitled Project'` | Project display name |
| `ratio` | TEXT | No | `'16:9'` | Aspect ratio string |
| `canvas_width` | INTEGER | No | `1920` | Canvas width in pixels |
| `canvas_height` | INTEGER | No | `1080` | Canvas height in pixels |
| `elements` | JSONB | No | `'[]'` | Array of canvas elements |
| `is_published` | BOOLEAN | No | `false` | Publication status |
| `publish_code` | TEXT | Yes | `NULL` | 6-character public access code |
| `published_at` | TIMESTAMPTZ | Yes | `NULL` | Publication timestamp |
| `created_at` | TIMESTAMPTZ | No | `now()` | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | No | `now()` | Last update timestamp |

**Why This Table Exists**: Central storage for all project data. The `elements` JSONB column stores the complete canvas state, allowing flexible element types without schema changes.

**Relationships**:
- `user_id` → `auth.users.id` (logical reference, not enforced FK)

**JSONB Elements Structure**:
```typescript
interface CanvasElement {
  id: string;           // UUID for element
  type: 'image' | 'video' | 'text' | 'ticker' | 'slideshow';
  position: { x: number; y: number };
  size: { width: number; height: number };
  zIndex: number;
  // Type-specific properties...
}
```

### View: `signage_projects_public`

**Purpose**: Read-only view exposing limited project fields for public access (deprecated in favor of RPC functions).

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Project identifier |
| `name` | TEXT | Project name |
| `ratio` | TEXT | Aspect ratio |
| `canvas_width` | INTEGER | Canvas dimensions |
| `canvas_height` | INTEGER | Canvas dimensions |
| `elements` | JSONB | Canvas elements |
| `is_published` | BOOLEAN | Must be `true` for access |
| `publish_code` | TEXT | Access code |
| `published_at` | TIMESTAMPTZ | Publication date |

**Note**: This view is now protected. All public access goes through RPC functions.

### Storage Bucket: `signage-media`

**Purpose**: Stores uploaded media files (images, videos) for use in signage projects.

| Property | Value |
|----------|-------|
| Bucket Name | `signage-media` |
| Public Access | Yes |
| File Types | Images, Videos |

---

## 5. API & Route Documentation

### Frontend Routes

| Route | Component | Auth Required | Description |
|-------|-----------|---------------|-------------|
| `/` | `Index` | No | Landing page with display code input |
| `/auth` | `Auth` | No | Login/Signup forms |
| `/admin` | `Editor` | Yes | Main signage editor |
| `/admin?project={id}` | `Editor` | Yes | Edit existing project |
| `/projects` | `Projects` | Yes | Project management list |
| `/display/{id}` | `Display` | No | Public display player |
| `/player/{id}` | `Display` | No | Legacy player route |

### Database RPC Functions

#### `get_published_project_by_code(code TEXT)`

**Purpose**: Retrieves a published project by its 6-character publish code.

**Security**: SECURITY DEFINER - bypasses RLS, validates `is_published = true`

```sql
-- Request
SELECT * FROM get_published_project_by_code('ABC123');

-- Response (single row or empty)
{
  id: UUID,
  name: TEXT,
  ratio: TEXT,
  canvas_width: INTEGER,
  canvas_height: INTEGER,
  elements: JSONB,
  is_published: BOOLEAN,
  published_at: TIMESTAMPTZ,
  publish_code: TEXT
}
```

**Usage in Code**:
```typescript
const { data, error } = await supabase
  .rpc('get_published_project_by_code', { code: 'ABC123' })
  .maybeSingle();
```

#### `get_published_project_by_id(project_id UUID)`

**Purpose**: Retrieves a published project by its UUID.

**Security**: SECURITY DEFINER - prevents enumeration by requiring exact ID

```sql
-- Request
SELECT * FROM get_published_project_by_id('550e8400-e29b-41d4-a716-446655440000');
```

### Supabase Client Operations

#### Create Project
```typescript
POST to signage_projects
Body: { name, ratio, canvas_width, canvas_height, elements, user_id }
RLS: Requires auth.uid() = user_id
```

#### Update Project
```typescript
PATCH to signage_projects WHERE id = {projectId}
Body: { name, ratio, elements, is_published, publish_code, published_at }
RLS: Requires auth.uid() = user_id
```

#### Delete Project
```typescript
DELETE from signage_projects WHERE id = {projectId}
RLS: Requires auth.uid() = user_id
```

#### List User Projects
```typescript
GET from signage_projects ORDER BY updated_at DESC
RLS: Returns only rows where auth.uid() = user_id
```

---

## 6. Business Logic Flow

### Project Creation Flow

```
1. User navigates to /admin
   └─► ProtectedRoute checks authentication
       └─► If not authenticated → Redirect to /auth
       └─► If authenticated → Render Editor

2. Editor initializes with useSignageProject hook
   └─► Sets default state: ratio='16:9', elements=[], projectId=null

3. User drags element from MediaSidebar
   └─► DndContext captures drag start
   └─► User drops on DroppableCanvas
   └─► handleDragEnd() called
       └─► Identifies element type from active.data.current
       └─► Calls handleAddElement(type)
           └─► Creates element with default properties
           └─► Calls addElement() from hook
               └─► Generates UUID, assigns zIndex
               └─► Updates elements state array
               └─► Selects new element

4. User modifies element in PropertyPanel
   └─► Input changes call onUpdate({ property: value })
   └─► updateElement() merges changes into element
   └─► Canvas re-renders with new properties

5. User clicks "Save"
   └─► handleSave() validates user auth
   └─► Serializes elements to JSON
   └─► If projectId exists:
       └─► UPDATE signage_projects SET ... WHERE id = projectId
   └─► If new project:
       └─► INSERT into signage_projects
       └─► Sets projectId from response
   └─► Shows success toast
```

### Publishing Flow

```
1. User clicks "Publish" button
   └─► handlePublish() starts

2. Generate unique publish code
   └─► If already published: reuse existing code
   └─► If new: generateUniquePublishCode()
       └─► Generate 6-char alphanumeric code
       └─► Query database for collision
       └─► Retry up to 10 times if collision
       └─► Return unique code

3. Save project with publish data
   └─► Same as save flow, plus:
       └─► is_published = true
       └─► published_at = now()
       └─► publish_code = generated code

4. Open PublishModal
   └─► Display publish code for copying
   └─► Display direct URL for sharing

5. Display can now be accessed at:
   └─► Via code: Enter code on landing page
   └─► Via URL: /display/{projectId}
```

### Display Loading Flow

```
1. User enters code on landing page (Index)
   └─► handleLoadDisplay() called

2. Validate code exists
   └─► Call RPC: get_published_project_by_code(code)
   └─► If no match: Show error toast
   └─► If match: Navigate to /display/{project.id}

3. Display page loads (Display.tsx)
   └─► useEffect calls loadProject(id)
   └─► Call RPC: get_published_project_by_id(id)
   └─► If error or not published: Show error screen
   └─► If success: Set elements and ratio state

4. Render display
   └─► Calculate viewport-relative positions
   └─► Render each element with absolute positioning
   └─► Start animations (tickers, slideshows)
   └─► Hide cursor for kiosk mode
```

---

## 7. View & UI Rendering Logic

### Component Hierarchy

```
App.tsx
├── BrowserRouter
│   └── Routes
│       ├── Index (/)
│       │   └── Landing page with code input
│       │
│       ├── Auth (/auth)
│       │   └── Login/Signup forms
│       │
│       ├── ProtectedRoute → Editor (/admin)
│       │   └── DndContext
│       │       ├── EditorToolbar
│       │       └── ResizablePanelGroup
│       │           ├── MediaSidebar (15%)
│       │           ├── DesignCanvas (60%)
│       │           │   └── DroppableCanvas
│       │           │       └── CanvasElement (per element)
│       │           └── PropertyPanel (25%)
│       │
│       ├── ProtectedRoute → Projects (/projects)
│       │   └── Project card grid
│       │
│       └── Display (/display/:id)
│           └── Fullscreen element renderer
```

### Design System Usage

All components use semantic design tokens from `index.css`:

```css
/* Base tokens */
--background: /* Page backgrounds */
--foreground: /* Primary text */
--card: /* Card/panel backgrounds */
--muted: /* Secondary backgrounds */
--primary: /* Brand accent color */
--destructive: /* Error/delete actions */
```

### Responsive Behavior

- **Desktop (1024px+)**: Full three-panel layout
- **Tablet (768px-1023px)**: Collapsible sidebars
- **Mobile (<768px)**: Editor not optimized; redirects recommended

### Reusable Component Patterns

**shadcn/ui Components** (`src/components/ui/`):
- Pre-styled, accessible components
- Customized via `className` prop
- Variants defined in component files

**Signage Components** (`src/components/signage/`):
- Domain-specific components
- Receive data via props
- Emit changes via callbacks

---

## 8. Authentication, Roles & Permissions

### Authentication System

**Provider**: Supabase Auth (email/password)

**Configuration**:
- Auto-confirm email signups enabled (no email verification required)
- Session persisted in localStorage
- Auto token refresh enabled

### User Flow

```
1. Unauthenticated user visits /admin
   └─► ProtectedRoute checks useAuth()
   └─► isAuthenticated = false
   └─► Redirect to /auth

2. User submits login/signup form
   └─► Supabase auth.signInWithPassword() or auth.signUp()
   └─► On success: session stored, redirect to /admin
   └─► On error: display error message

3. Authenticated user visits /admin
   └─► ProtectedRoute validates session
   └─► Render Editor component
```

### Row-Level Security Policies

**Table: `signage_projects`**

| Policy | Command | Expression |
|--------|---------|------------|
| Users can view own projects | SELECT | `auth.uid() = user_id` |
| Users can create own projects | INSERT | `auth.uid() = user_id` |
| Users can update own projects | UPDATE | `auth.uid() = user_id` |
| Users can delete own projects | DELETE | `auth.uid() = user_id` |

**Security Model**:
- All policies are RESTRICTIVE (default deny)
- No cross-user data access possible
- Public display access via SECURITY DEFINER functions only

### Where Access Control Is Applied

1. **Route Level**: `ProtectedRoute` component wraps authenticated pages
2. **Database Level**: RLS policies enforce ownership
3. **Function Level**: RPC functions validate `is_published` for public access

---

## 9. Important Code Snippets

### useSignageProject Hook (State Management)

```typescript
// src/hooks/useSignageProject.ts
export function useSignageProject(options: UseSignageProjectOptions = {}) {
  const [elements, setElements] = useState<CanvasElement[]>([]);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);

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

  // ... more operations
}
```

**Explanation**: This hook encapsulates all canvas state management, providing a clean API for element CRUD operations.

### Publish Code Generation

```typescript
// src/pages/Editor.tsx
function generatePublishCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Excludes confusing chars (0, O, 1, I)
  const randomValues = new Uint8Array(6);
  crypto.getRandomValues(randomValues);
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(randomValues[i] % chars.length);
  }
  return code;
}

async function generateUniquePublishCode(): Promise<string> {
  const maxAttempts = 10;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const code = generatePublishCode();
    const { data } = await supabase
      .from('signage_projects')
      .select('id')
      .eq('publish_code', code)
      .maybeSingle();
    if (!data) return code; // No collision
  }
  throw new Error('Failed to generate unique publish code');
}
```

**Explanation**: Uses cryptographic randomness and collision detection to generate unique, user-friendly codes.

### Element Type Definitions

```typescript
// src/types/signage.ts
export type ElementType = 'image' | 'slideshow' | 'video' | 'ticker' | 'text';

export interface BaseElement {
  id: string;
  type: ElementType;
  position: Position;
  size: Size;
  zIndex: number;
}

export interface ImageElement extends BaseElement {
  type: 'image';
  src: string;
  alt?: string;
  objectFit?: 'cover' | 'contain' | 'fill';
}

// Union type for all elements
export type CanvasElement = ImageElement | SlideshowElement | VideoElement | TickerElement | TextElement;
```

**Explanation**: TypeScript discriminated unions enable type-safe handling of different element types.

### RPC Function (Database)

```sql
-- Secure public project retrieval
CREATE OR REPLACE FUNCTION public.get_published_project_by_code(code text)
RETURNS TABLE(
  id uuid, name text, ratio text, canvas_width integer, canvas_height integer,
  elements jsonb, is_published boolean, published_at timestamptz, publish_code text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT p.id, p.name, p.ratio, p.canvas_width, p.canvas_height, 
         p.elements, p.is_published, p.published_at, p.publish_code
  FROM signage_projects p
  WHERE p.is_published = true 
    AND p.publish_code IS NOT NULL
    AND UPPER(p.publish_code) = UPPER(code);
END;
$$;
```

**Explanation**: SECURITY DEFINER allows the function to bypass RLS while enforcing its own validation (`is_published = true`).

---

## 10. Configuration & Environment Setup

### Environment Variables

**File**: `.env` (auto-managed by Lovable Cloud)

```env
VITE_SUPABASE_URL="https://[project-id].supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="eyJ..."
VITE_SUPABASE_PROJECT_ID="[project-id]"
```

| Variable | Purpose | Required |
|----------|---------|----------|
| `VITE_SUPABASE_URL` | Supabase API endpoint | Yes |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Anonymous client key | Yes |
| `VITE_SUPABASE_PROJECT_ID` | Project identifier | Yes |

**Note**: These are automatically configured by Lovable Cloud. Do not edit manually.

### Supabase Configuration

**File**: `supabase/config.toml`

Contains project-specific configuration for local development and migrations.

### Tailwind Configuration

**File**: `tailwind.config.ts`

```typescript
export default {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        // ... more semantic colors
      },
    },
  },
};
```

### Storage Configuration

Media files are stored in the `signage-media` bucket:
- Public read access enabled
- Files accessible via: `https://[project-id].supabase.co/storage/v1/object/public/signage-media/[path]`

---

## 11. How to Run the Project Locally

### Prerequisites

- Node.js 18+ or Bun runtime
- Git

### Installation Steps

```bash
# 1. Clone the repository
git clone <repository-url>
cd <project-directory>

# 2. Install dependencies
npm install
# or
bun install

# 3. Environment is auto-configured by Lovable Cloud
# No manual .env setup required

# 4. Start development server
npm run dev
# or
bun dev

# 5. Open browser
# Navigate to http://localhost:5173
```

### Build for Production

```bash
# Create production build
npm run build

# Preview production build locally
npm run preview
```

### Database Migrations

Migrations are automatically applied by Lovable Cloud. Manual migration is not required.

---

## 12. Error Handling & Logging

### Frontend Error Handling

**Toast Notifications** (via Sonner):
```typescript
import { toast } from 'sonner';

// Success
toast.success('Project saved!');

// Error
toast.error('Failed to save project');

// With description
toast.error('Failed to load display', {
  description: 'Please check your display code'
});
```

### API Error Handling

```typescript
try {
  const { data, error } = await supabase
    .from('signage_projects')
    .select('*');
  
  if (error) throw error;
  
  // Success handling
} catch (error) {
  console.error('Database error:', error);
  toast.error('Operation failed');
}
```

### Validation Errors

Form validation is handled by React Hook Form with Zod schemas:
```typescript
const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password too short'),
});
```

### Console Logging

Development logging follows patterns:
- `console.error()` - Errors that need attention
- `console.warn()` - Potential issues
- `console.log()` - Development debugging (remove in production)

### Debugging Approach

1. Check browser console for JavaScript errors
2. Check Network tab for failed API calls
3. Use React DevTools to inspect component state
4. Check Supabase logs for database errors

---

## 13. Future Scalability & Extension Points

### Adding New Element Types

1. Add type to `ElementType` union in `src/types/signage.ts`
2. Create element interface extending `BaseElement`
3. Add to `CanvasElement` union type
4. Update `handleAddElement()` in `Editor.tsx`
5. Add case to `renderElement()` in canvas components
6. Create property panel section for element-specific settings

### Adding New Features

| Feature | Extension Point |
|---------|-----------------|
| Real-time collaboration | Add Supabase Realtime subscriptions |
| Scheduling | Add `scheduled_at`, `expires_at` columns |
| Analytics | Track display views in separate table |
| Templates | Expand template system with cloud storage |
| Multi-language | Add i18n configuration |

### Performance Scaling

- **Large canvas**: Implement virtualization for many elements
- **Media optimization**: Add image resizing on upload
- **Caching**: Implement React Query caching strategies
- **CDN**: Media already served via Supabase CDN

### Database Scaling

- Add indexes on frequently queried columns
- Archive old projects to separate table
- Implement soft deletes for recovery

---

## 14. Developer Notes & Best Practices

### Coding Conventions

**File Naming**:
- Components: PascalCase (`PropertyPanel.tsx`)
- Hooks: camelCase with `use` prefix (`useSignageProject.ts`)
- Types: PascalCase (`signage.ts`)
- Utilities: camelCase (`utils.ts`)

**Component Structure**:
```typescript
// 1. Imports
import { useState } from 'react';

// 2. Types
interface Props { ... }

// 3. Component
export function MyComponent({ prop }: Props) {
  // a. Hooks
  const [state, setState] = useState();
  
  // b. Handlers
  const handleClick = () => { ... };
  
  // c. Render
  return ( ... );
}
```

### Folder Discipline

- One component per file
- Group related components in subdirectories
- Keep hooks in `/hooks`
- Keep types in `/types`
- UI components in `/components/ui`
- Domain components in `/components/[domain]`

### State Management Rules

1. Local state for UI-only concerns
2. `useSignageProject` for canvas state
3. React Query for server state
4. URL params for navigation state

### Security Considerations

- Never expose `user_id` in public responses
- Always use RPC functions for public data access
- Validate all inputs on both client and server
- Use RLS policies as primary authorization

### Things New Developers Must Know

1. **Never edit auto-generated files**: `.env`, `supabase/client.ts`, `supabase/types.ts`
2. **RLS is enabled**: All database access requires authentication or RPC
3. **Elements are JSONB**: Schema changes to elements don't require migrations
4. **Publish codes are case-insensitive**: Stored uppercase, compared uppercase
5. **Media bucket is public**: Anyone with URL can access uploaded files

### Git Commit Guidelines

```
feat: Add slideshow element type
fix: Correct element positioning on display
refactor: Extract canvas logic to hook
docs: Update API documentation
style: Format PropertyPanel component
```

---

## Appendix: Quick Reference

### Key Files

| File | Purpose |
|------|---------|
| `src/App.tsx` | Route definitions |
| `src/pages/Editor.tsx` | Main editor logic |
| `src/hooks/useSignageProject.ts` | Canvas state management |
| `src/types/signage.ts` | Type definitions |
| `src/pages/Display.tsx` | Public display renderer |

### Common Operations

```typescript
// Using the abstraction layers (recommended)
import { db } from '@/lib/database';
import { auth } from '@/lib/auth';
import { storage } from '@/lib/storage';

// Add element
addElement({ type: 'text', position: {...}, size: {...}, content: '...' });

// Update element
updateElement(elementId, { content: 'New text' });

// Save project (via abstraction)
await db.updateProject(projectId, data);

// Load public project (via abstraction)
await db.getPublishedProjectByCode('ABC123');

// Upload file
const { url, error } = await storage.uploadFile(file, 'path/to/file');

// Check authentication
const { user } = await auth.getUser();
```

### Useful Commands

```bash
npm run dev      # Start development server
npm run build    # Production build
npm run preview  # Preview production build
npm run lint     # Run ESLint
npm run test     # Run tests
```

---

## 15. Self-Hosted Deployment

### Overview

The application supports self-hosted deployment with configurable backend providers. This allows running the entire stack on your own VPS without external dependencies.

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Environment Variables                     │
│  DATABASE_PROVIDER | AUTH_PROVIDER | STORAGE_PROVIDER        │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                   Abstraction Layer                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │  db (API)   │  │ auth (API)  │  │   storage (API)     │ │
│  └──────┬──────┘  └──────┬──────┘  └──────────┬──────────┘ │
└─────────┼────────────────┼─────────────────────┼────────────┘
          │                │                     │
    ┌─────┴─────┐    ┌─────┴─────┐         ┌─────┴─────┐
    ▼           ▼    ▼           ▼         ▼           ▼
┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐
│Supabase│ │Postgres│ │Supabase│ │Local   │ │Supabase│ │Local/S3│
│Adapter │ │Adapter │ │Adapter │ │JWT     │ │Adapter │ │Adapter │
└────────┘ └────────┘ └────────┘ └────────┘ └────────┘ └────────┘
```

### Configuration

Set providers via environment variables:

```bash
# Backend providers
DATABASE_PROVIDER=postgres    # supabase | postgres
AUTH_PROVIDER=local           # supabase | local
STORAGE_PROVIDER=local        # supabase | local | s3

# PostgreSQL (when DATABASE_PROVIDER=postgres)
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=signage_user
POSTGRES_PASSWORD=your_password
POSTGRES_DATABASE=signage_db

# JWT (when AUTH_PROVIDER=local)
JWT_SECRET=your-secret-key-min-32-chars
JWT_EXPIRES_IN=7d

# Storage (when STORAGE_PROVIDER=local)
STORAGE_PATH=./uploads
STORAGE_URL=http://localhost:3000/uploads
```

### Key Files

| File | Purpose |
|------|---------|
| `src/lib/config.ts` | Environment configuration |
| `src/lib/database/index.ts` | Database adapter selection |
| `src/lib/auth/index.ts` | Auth adapter selection |
| `src/lib/storage/index.ts` | Storage adapter selection |
| `docs/query.md` | PostgreSQL schema for self-hosting |
| `docs/SELF_HOSTED_SETUP.md` | VPS deployment guide |
| `.env.example` | Configuration template |
| `docker-compose.yml` | Container orchestration |

### Deployment Options

1. **Docker Compose** (Recommended)
   - Includes PostgreSQL, Redis, MinIO
   - Single command: `docker-compose up -d`

2. **Manual VPS Setup**
   - Follow `docs/SELF_HOSTED_SETUP.md`
   - Requires Nginx, PostgreSQL, Node.js

3. **Hybrid** (Supabase + Self-Hosted Storage)
   - Use Supabase for auth/database
   - Self-hosted S3-compatible storage

### Migration Path

To migrate from Lovable Cloud to self-hosted:

1. Export database schema from `docs/query.md`
2. Set up PostgreSQL and run schema
3. Export media files from Supabase Storage
4. Configure environment variables
5. Deploy with Docker or manually

---

*Last updated: January 2026*
*Documentation version: 2.0.0*
