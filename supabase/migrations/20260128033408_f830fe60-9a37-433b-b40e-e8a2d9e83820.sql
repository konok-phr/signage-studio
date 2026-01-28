-- Fix 1: Drop overly permissive storage policies that allow any authenticated user to modify/delete files
DROP POLICY IF EXISTS "Authenticated users can update signage media" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete signage media" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload signage media" ON storage.objects;

-- Create user-scoped storage policies (files must be in user's folder)
-- Users can upload only to their own folder
CREATE POLICY "Users can upload to own folder"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'signage-media' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Users can update only their own files
CREATE POLICY "Users can update own files"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'signage-media' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Users can delete only their own files
CREATE POLICY "Users can delete own files"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'signage-media' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Fix 2: Remove the policy that exposes user_id on published projects
-- The signage_projects_public view should be used instead for public access
DROP POLICY IF EXISTS "Anyone can view published projects for display" ON public.signage_projects;