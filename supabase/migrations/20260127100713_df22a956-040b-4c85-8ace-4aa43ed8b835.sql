-- Add a unique publish code column for public access
ALTER TABLE public.signage_projects 
ADD COLUMN IF NOT EXISTS publish_code TEXT UNIQUE;

-- Create index for quick code lookups
CREATE INDEX IF NOT EXISTS idx_signage_projects_publish_code ON public.signage_projects(publish_code);

-- Update RLS policy to allow viewing by publish code
DROP POLICY IF EXISTS "Anyone can view by publish code" ON public.signage_projects;
CREATE POLICY "Anyone can view by publish code" 
ON public.signage_projects 
FOR SELECT 
USING (publish_code IS NOT NULL AND is_published = true);

-- Allow anyone to view projects (for admin and code lookup)
DROP POLICY IF EXISTS "Anyone can view all projects" ON public.signage_projects;
CREATE POLICY "Anyone can view all projects" 
ON public.signage_projects 
FOR SELECT 
USING (true);