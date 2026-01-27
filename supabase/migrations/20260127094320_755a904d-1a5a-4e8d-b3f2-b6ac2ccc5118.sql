-- Create signage_projects table for storing project layouts
CREATE TABLE public.signage_projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL DEFAULT 'Untitled Project',
  ratio TEXT NOT NULL DEFAULT '16:9',
  canvas_width INTEGER NOT NULL DEFAULT 1920,
  canvas_height INTEGER NOT NULL DEFAULT 1080,
  elements JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_published BOOLEAN NOT NULL DEFAULT false,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.signage_projects ENABLE ROW LEVEL SECURITY;

-- Create policy for public access (no auth required for now)
-- Anyone can view published projects
CREATE POLICY "Anyone can view published projects" 
ON public.signage_projects 
FOR SELECT 
USING (is_published = true);

-- Anyone can create projects (for MVP without auth)
CREATE POLICY "Anyone can create projects" 
ON public.signage_projects 
FOR INSERT 
WITH CHECK (true);

-- Anyone can update their projects (for MVP without auth)
CREATE POLICY "Anyone can update projects" 
ON public.signage_projects 
FOR UPDATE 
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_signage_projects_updated_at
BEFORE UPDATE ON public.signage_projects
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for media uploads
INSERT INTO storage.buckets (id, name, public) VALUES ('signage-media', 'signage-media', true);

-- Create policies for media uploads
CREATE POLICY "Anyone can view signage media" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'signage-media');

CREATE POLICY "Anyone can upload signage media" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'signage-media');

CREATE POLICY "Anyone can update signage media" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'signage-media');

CREATE POLICY "Anyone can delete signage media" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'signage-media');