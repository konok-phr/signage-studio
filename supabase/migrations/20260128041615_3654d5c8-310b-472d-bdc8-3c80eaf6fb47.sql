-- Create RPC function to get a published project by publish_code
-- This replaces direct view access and requires the publish_code to retrieve data
CREATE OR REPLACE FUNCTION public.get_published_project_by_code(code TEXT)
RETURNS TABLE(
  id UUID, 
  name TEXT, 
  ratio TEXT, 
  canvas_width INT, 
  canvas_height INT, 
  elements JSONB, 
  is_published BOOL, 
  published_at TIMESTAMPTZ, 
  publish_code TEXT
)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
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
$$;

-- Create RPC function to get a published project by ID
-- This is used by the display page to load the project by its UUID
CREATE OR REPLACE FUNCTION public.get_published_project_by_id(project_id UUID)
RETURNS TABLE(
  id UUID, 
  name TEXT, 
  ratio TEXT, 
  canvas_width INT, 
  canvas_height INT, 
  elements JSONB, 
  is_published BOOL, 
  published_at TIMESTAMPTZ, 
  publish_code TEXT
)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id, p.name, p.ratio, p.canvas_width, p.canvas_height, 
    p.elements, p.is_published, p.published_at, p.publish_code
  FROM signage_projects p
  WHERE p.is_published = true 
    AND p.id = project_id;
END;
$$;

-- Grant execute permissions to anon and authenticated roles
GRANT EXECUTE ON FUNCTION public.get_published_project_by_code(TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_published_project_by_id(UUID) TO anon, authenticated;

-- Revoke direct access to the public view to prevent enumeration
REVOKE ALL ON public.signage_projects_public FROM anon, authenticated;