# Digital Signage Database Schema

Complete PostgreSQL queries to set up your local database for the self-hosted digital signage application.

## Prerequisites

- PostgreSQL 14+ installed
- psql or pgAdmin access

---

## 1. Create Database and User

```sql
-- Create the database user
CREATE USER signage_user WITH PASSWORD 'your_secure_password_here';

-- Create the database
CREATE DATABASE signage_db OWNER signage_user;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE signage_db TO signage_user;

-- Connect to the database
\c signage_db

-- Grant schema privileges
GRANT ALL ON SCHEMA public TO signage_user;
```

---

## 2. Enable Required Extensions

```sql
-- UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- For password hashing (pgcrypto)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
```

---

## 3. Users Table (Authentication)

```sql
-- Users table for local authentication
CREATE TABLE public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    email_verified BOOLEAN NOT NULL DEFAULT false,
    email_verified_at TIMESTAMP WITH TIME ZONE,
    last_sign_in_at TIMESTAMP WITH TIME ZONE
);

-- Index for email lookups
CREATE INDEX idx_users_email ON public.users(email);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
```

---

## 4. Sessions Table (JWT Refresh Tokens)

```sql
-- Sessions table for refresh token management
CREATE TABLE public.sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    refresh_token TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    user_agent TEXT,
    ip_address INET
);

-- Index for token lookups
CREATE INDEX idx_sessions_refresh_token ON public.sessions(refresh_token);
CREATE INDEX idx_sessions_user_id ON public.sessions(user_id);
CREATE INDEX idx_sessions_expires_at ON public.sessions(expires_at);

-- Cleanup expired sessions (run periodically via cron)
CREATE OR REPLACE FUNCTION public.cleanup_expired_sessions()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM public.sessions WHERE expires_at < now();
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;
```

---

## 5. Signage Projects Table

```sql
-- Main signage projects table
CREATE TABLE public.signage_projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL DEFAULT 'Untitled Project',
    ratio TEXT NOT NULL DEFAULT '16:9',
    canvas_width INTEGER NOT NULL DEFAULT 1920,
    canvas_height INTEGER NOT NULL DEFAULT 1080,
    elements JSONB NOT NULL DEFAULT '[]'::jsonb,
    is_published BOOLEAN NOT NULL DEFAULT false,
    publish_code TEXT UNIQUE,
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Indexes for common queries
CREATE INDEX idx_signage_projects_user_id ON public.signage_projects(user_id);
CREATE INDEX idx_signage_projects_publish_code ON public.signage_projects(publish_code) WHERE publish_code IS NOT NULL;
CREATE INDEX idx_signage_projects_is_published ON public.signage_projects(is_published) WHERE is_published = true;

-- Trigger for updated_at
CREATE TRIGGER update_signage_projects_updated_at
    BEFORE UPDATE ON public.signage_projects
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
```

---

## 6. Helper Functions

### Get Published Project by ID

```sql
-- Function to retrieve published project by ID (public access)
CREATE OR REPLACE FUNCTION public.get_published_project_by_id(project_id UUID)
RETURNS TABLE (
    id UUID,
    name TEXT,
    ratio TEXT,
    canvas_width INTEGER,
    canvas_height INTEGER,
    elements JSONB,
    is_published BOOLEAN,
    published_at TIMESTAMP WITH TIME ZONE,
    publish_code TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id, p.name, p.ratio, p.canvas_width, p.canvas_height,
        p.elements, p.is_published, p.published_at, p.publish_code
    FROM public.signage_projects p
    WHERE p.is_published = true 
      AND p.id = project_id;
END;
$$;
```

### Get Published Project by Code

```sql
-- Function to retrieve published project by publish code (public access)
CREATE OR REPLACE FUNCTION public.get_published_project_by_code(code TEXT)
RETURNS TABLE (
    id UUID,
    name TEXT,
    ratio TEXT,
    canvas_width INTEGER,
    canvas_height INTEGER,
    elements JSONB,
    is_published BOOLEAN,
    published_at TIMESTAMP WITH TIME ZONE,
    publish_code TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id, p.name, p.ratio, p.canvas_width, p.canvas_height,
        p.elements, p.is_published, p.published_at, p.publish_code
    FROM public.signage_projects p
    WHERE p.is_published = true 
      AND p.publish_code IS NOT NULL
      AND UPPER(p.publish_code) = UPPER(code);
END;
$$;
```

### Generate Unique Publish Code

```sql
-- Function to generate a unique 6-character publish code
CREATE OR REPLACE FUNCTION public.generate_publish_code()
RETURNS TEXT AS $$
DECLARE
    chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    result TEXT := '';
    i INTEGER;
BEGIN
    FOR i IN 1..6 LOOP
        result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
    END LOOP;
    RETURN result;
END;
$$ LANGUAGE plpgsql;
```

---

## 7. Media Storage Table (Optional - for tracking uploads)

```sql
-- Media files metadata table (optional, for local storage tracking)
CREATE TABLE public.media_files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    filename TEXT NOT NULL,
    original_name TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    size_bytes BIGINT NOT NULL,
    storage_path TEXT NOT NULL,
    public_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_media_files_user_id ON public.media_files(user_id);
CREATE INDEX idx_media_files_mime_type ON public.media_files(mime_type);
```

---

## 8. Complete Setup Script

Run this complete script to set up everything at once:

```sql
-- ============================================
-- DIGITAL SIGNAGE DATABASE SETUP SCRIPT
-- Run this as a superuser (postgres)
-- ============================================

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.generate_publish_code()
RETURNS TEXT AS $$
DECLARE
    chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    result TEXT := '';
    i INTEGER;
BEGIN
    FOR i IN 1..6 LOOP
        result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
    END LOOP;
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- USERS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    email_verified BOOLEAN NOT NULL DEFAULT false,
    email_verified_at TIMESTAMP WITH TIME ZONE,
    last_sign_in_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);

DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- SESSIONS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    refresh_token TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    user_agent TEXT,
    ip_address INET
);

CREATE INDEX IF NOT EXISTS idx_sessions_refresh_token ON public.sessions(refresh_token);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON public.sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON public.sessions(expires_at);

CREATE OR REPLACE FUNCTION public.cleanup_expired_sessions()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM public.sessions WHERE expires_at < now();
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- SIGNAGE PROJECTS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.signage_projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL DEFAULT 'Untitled Project',
    ratio TEXT NOT NULL DEFAULT '16:9',
    canvas_width INTEGER NOT NULL DEFAULT 1920,
    canvas_height INTEGER NOT NULL DEFAULT 1080,
    elements JSONB NOT NULL DEFAULT '[]'::jsonb,
    is_published BOOLEAN NOT NULL DEFAULT false,
    publish_code TEXT UNIQUE,
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_signage_projects_user_id ON public.signage_projects(user_id);
CREATE INDEX IF NOT EXISTS idx_signage_projects_publish_code ON public.signage_projects(publish_code) WHERE publish_code IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_signage_projects_is_published ON public.signage_projects(is_published) WHERE is_published = true;

DROP TRIGGER IF EXISTS update_signage_projects_updated_at ON public.signage_projects;
CREATE TRIGGER update_signage_projects_updated_at
    BEFORE UPDATE ON public.signage_projects
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- MEDIA FILES TABLE (Optional)
-- ============================================

CREATE TABLE IF NOT EXISTS public.media_files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    filename TEXT NOT NULL,
    original_name TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    size_bytes BIGINT NOT NULL,
    storage_path TEXT NOT NULL,
    public_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_media_files_user_id ON public.media_files(user_id);
CREATE INDEX IF NOT EXISTS idx_media_files_mime_type ON public.media_files(mime_type);

-- ============================================
-- PUBLIC ACCESS FUNCTIONS
-- ============================================

CREATE OR REPLACE FUNCTION public.get_published_project_by_id(project_id UUID)
RETURNS TABLE (
    id UUID,
    name TEXT,
    ratio TEXT,
    canvas_width INTEGER,
    canvas_height INTEGER,
    elements JSONB,
    is_published BOOLEAN,
    published_at TIMESTAMP WITH TIME ZONE,
    publish_code TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id, p.name, p.ratio, p.canvas_width, p.canvas_height,
        p.elements, p.is_published, p.published_at, p.publish_code
    FROM public.signage_projects p
    WHERE p.is_published = true 
      AND p.id = project_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_published_project_by_code(code TEXT)
RETURNS TABLE (
    id UUID,
    name TEXT,
    ratio TEXT,
    canvas_width INTEGER,
    canvas_height INTEGER,
    elements JSONB,
    is_published BOOLEAN,
    published_at TIMESTAMP WITH TIME ZONE,
    publish_code TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id, p.name, p.ratio, p.canvas_width, p.canvas_height,
        p.elements, p.is_published, p.published_at, p.publish_code
    FROM public.signage_projects p
    WHERE p.is_published = true 
      AND p.publish_code IS NOT NULL
      AND UPPER(p.publish_code) = UPPER(code);
END;
$$;

-- ============================================
-- SETUP COMPLETE
-- ============================================
SELECT 'Database setup complete!' as status;
```

---

## 9. JSONB Elements Schema Reference

The `elements` column stores an array of canvas elements. Here's the TypeScript type reference:

```typescript
type ElementType = 'image' | 'slideshow' | 'video' | 'ticker' | 'text' | 'audio';

interface Position { x: number; y: number; }
interface Size { width: number; height: number; }

interface BaseElement {
  id: string;
  type: ElementType;
  position: Position;
  size: Size;
  zIndex: number;
}

// Image Element
interface ImageElement extends BaseElement {
  type: 'image';
  src: string;
  alt?: string;
  objectFit?: 'cover' | 'contain' | 'fill';
}

// Slideshow Element
interface SlideshowElement extends BaseElement {
  type: 'slideshow';
  images: { src: string; duration: number }[];
  transition: 'fade' | 'slide' | 'none';
  autoPlay: boolean;
}

// Video Element
interface VideoElement extends BaseElement {
  type: 'video';
  src: string;
  videos?: { src: string }[];
  autoPlay: boolean;
  loop: boolean;
  muted: boolean;
}

// Ticker Element
interface TickerElement extends BaseElement {
  type: 'ticker';
  text: string;
  speed: number;
  fontSize: number;
  color: string;
  backgroundColor: string;
}

// Text Element
interface TextElement extends BaseElement {
  type: 'text';
  content: string;
  fontSize: number;
  fontWeight: 'normal' | 'bold';
  color: string;
  backgroundColor: string;
  textAlign: 'left' | 'center' | 'right';
  fontFamily: string;
}

// Audio Element
interface AudioElement extends BaseElement {
  type: 'audio';
  src: string;
  autoPlay: boolean;
  loop: boolean;
  volume: number;
}
```

### Example JSONB Data

```json
[
  {
    "id": "elem-1",
    "type": "image",
    "position": { "x": 0, "y": 0 },
    "size": { "width": 800, "height": 600 },
    "zIndex": 1,
    "src": "/uploads/images/hero.jpg",
    "objectFit": "cover"
  },
  {
    "id": "elem-2",
    "type": "ticker",
    "position": { "x": 0, "y": 1000 },
    "size": { "width": 1920, "height": 80 },
    "zIndex": 10,
    "text": "Welcome to our store!",
    "speed": 1,
    "fontSize": 32,
    "color": "#ffffff",
    "backgroundColor": "#000000"
  }
]
```

---

## 10. Maintenance Queries

### Clean up expired sessions (run daily via cron)

```sql
SELECT public.cleanup_expired_sessions();
```

### Get database statistics

```sql
-- Count projects per user
SELECT u.email, COUNT(p.id) as project_count
FROM public.users u
LEFT JOIN public.signage_projects p ON u.id = p.user_id
GROUP BY u.id, u.email
ORDER BY project_count DESC;

-- Get published projects count
SELECT COUNT(*) as published_count 
FROM public.signage_projects 
WHERE is_published = true;

-- Storage usage by user
SELECT u.email, 
       COUNT(m.id) as file_count,
       SUM(m.size_bytes) / 1024 / 1024 as total_mb
FROM public.users u
LEFT JOIN public.media_files m ON u.id = m.user_id
GROUP BY u.id, u.email
ORDER BY total_mb DESC NULLS LAST;
```

---

## Notes

1. **Password Hashing**: Use bcrypt in your application code, not in SQL. The `password_hash` column stores the bcrypt hash.

2. **Indexes**: The indexes are optimized for common query patterns. Add more as needed based on your usage.

3. **Foreign Keys**: All user-related tables have `ON DELETE CASCADE` to clean up when a user is deleted.

4. **Publish Code**: The 6-character code uses uppercase letters (excluding I, O) and numbers (excluding 0, 1) to avoid confusion.

5. **JSONB**: PostgreSQL's JSONB type allows efficient querying of the elements array if needed.
