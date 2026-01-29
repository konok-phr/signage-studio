-- ============================================
-- NEXT.JS SELF-HOSTED DATABASE SCHEMA
-- ============================================
-- This SQL file creates all tables needed for the self-hosted version.
-- Run this on your local PostgreSQL database.

-- ============================================
-- 1. CREATE DATABASE (run as superuser)
-- ============================================
-- CREATE DATABASE signage_db;
-- CREATE USER signage_user WITH ENCRYPTED PASSWORD 'your_password';
-- GRANT ALL PRIVILEGES ON DATABASE signage_db TO signage_user;

-- Connect to signage_db before running the rest

-- ============================================
-- 2. ENABLE UUID EXTENSION
-- ============================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- 3. USERS TABLE (for local JWT auth)
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for email lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- ============================================
-- 4. SESSIONS TABLE (for refresh tokens)
-- ============================================
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  refresh_token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for token lookups
CREATE INDEX IF NOT EXISTS idx_sessions_refresh_token ON sessions(refresh_token);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);

-- ============================================
-- 5. SIGNAGE PROJECTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS signage_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Untitled Project',
  ratio TEXT NOT NULL DEFAULT '16:9',
  canvas_width INTEGER NOT NULL DEFAULT 1920,
  canvas_height INTEGER NOT NULL DEFAULT 1080,
  elements JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_published BOOLEAN NOT NULL DEFAULT false,
  publish_code TEXT UNIQUE,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_signage_projects_user_id ON signage_projects(user_id);
CREATE INDEX IF NOT EXISTS idx_signage_projects_publish_code ON signage_projects(publish_code) WHERE publish_code IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_signage_projects_is_published ON signage_projects(is_published) WHERE is_published = true;

-- ============================================
-- 6. AUTOMATIC UPDATED_AT TRIGGER
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to users
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to signage_projects
DROP TRIGGER IF EXISTS update_signage_projects_updated_at ON signage_projects;
CREATE TRIGGER update_signage_projects_updated_at
  BEFORE UPDATE ON signage_projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 7. HELPER FUNCTIONS
-- ============================================

-- Function to generate unique publish code
CREATE OR REPLACE FUNCTION generate_publish_code()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..6 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to get published project by ID (for public display)
CREATE OR REPLACE FUNCTION get_published_project_by_id(project_id UUID)
RETURNS TABLE (
  id UUID,
  name TEXT,
  ratio TEXT,
  canvas_width INTEGER,
  canvas_height INTEGER,
  elements JSONB,
  is_published BOOLEAN,
  published_at TIMESTAMPTZ,
  publish_code TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id, p.name, p.ratio, p.canvas_width, p.canvas_height, 
    p.elements, p.is_published, p.published_at, p.publish_code
  FROM signage_projects p
  WHERE p.is_published = true AND p.id = project_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get published project by code (for public display)
CREATE OR REPLACE FUNCTION get_published_project_by_code(code TEXT)
RETURNS TABLE (
  id UUID,
  name TEXT,
  ratio TEXT,
  canvas_width INTEGER,
  canvas_height INTEGER,
  elements JSONB,
  is_published BOOLEAN,
  published_at TIMESTAMPTZ,
  publish_code TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id, p.name, p.ratio, p.canvas_width, p.canvas_height, 
    p.elements, p.is_published, p.published_at, p.publish_code
  FROM signage_projects p
  WHERE p.is_published = true 
    AND p.publish_code IS NOT NULL
    AND UPPER(p.publish_code) = UPPER(code);
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 8. CLEANUP EXPIRED SESSIONS (run periodically)
-- ============================================
-- DELETE FROM sessions WHERE expires_at < NOW();

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- Run these to verify the schema was created correctly:

-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'signage_projects';
-- SELECT indexname FROM pg_indexes WHERE schemaname = 'public';
