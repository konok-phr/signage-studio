-- Add NOT NULL constraint to prevent future orphaned records
ALTER TABLE public.signage_projects 
ALTER COLUMN user_id SET NOT NULL;