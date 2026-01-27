-- ================================================
-- SECURITY FIX: Add user ownership and proper RLS
-- ================================================

-- 1. Add user_id column to signage_projects for ownership tracking
ALTER TABLE public.signage_projects 
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- 2. Create index for faster lookups
CREATE INDEX idx_signage_projects_user_id ON public.signage_projects(user_id);

-- 3. Drop existing permissive policies
DROP POLICY IF EXISTS "Anyone can create projects" ON public.signage_projects;
DROP POLICY IF EXISTS "Anyone can update projects" ON public.signage_projects;
DROP POLICY IF EXISTS "Anyone can view all projects" ON public.signage_projects;
DROP POLICY IF EXISTS "Anyone can view by publish code" ON public.signage_projects;
DROP POLICY IF EXISTS "Anyone can view published projects" ON public.signage_projects;

-- 4. Create secure RLS policies for signage_projects

-- Allow authenticated users to create their own projects
CREATE POLICY "Users can create own projects"
ON public.signage_projects
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Allow users to view their own projects (both draft and published)
CREATE POLICY "Users can view own projects"
ON public.signage_projects
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Allow anyone (including anonymous) to view published projects for display
CREATE POLICY "Anyone can view published projects for display"
ON public.signage_projects
FOR SELECT
USING (is_published = true AND publish_code IS NOT NULL);

-- Allow users to update their own projects
CREATE POLICY "Users can update own projects"
ON public.signage_projects
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own projects
CREATE POLICY "Users can delete own projects"
ON public.signage_projects
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- ================================================
-- SECURITY FIX: Storage bucket policies
-- ================================================

-- 5. Keep bucket public for reading (displays need to show images)
-- but restrict write operations to authenticated users

-- Drop existing permissive storage policies
DROP POLICY IF EXISTS "Anyone can upload signage media" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can update signage media" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete signage media" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view signage media" ON storage.objects;

-- Allow anyone to read from the bucket (for public displays)
CREATE POLICY "Public read access for signage media"
ON storage.objects
FOR SELECT
USING (bucket_id = 'signage-media');

-- Allow only authenticated users to upload
CREATE POLICY "Authenticated users can upload signage media"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'signage-media');

-- Allow authenticated users to update their uploads (bucket-level, no folder structure)
CREATE POLICY "Authenticated users can update signage media"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'signage-media');

-- Allow authenticated users to delete from the bucket
CREATE POLICY "Authenticated users can delete signage media"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'signage-media');