-- Create a public view for published projects that excludes sensitive fields
CREATE VIEW public.signage_projects_public
WITH (security_invoker=on) AS
SELECT 
  id,
  name,
  ratio,
  canvas_width,
  canvas_height,
  elements,
  is_published,
  published_at,
  publish_code
  -- Excludes: user_id, created_at, updated_at (sensitive/internal fields)
FROM public.signage_projects
WHERE is_published = true AND publish_code IS NOT NULL;

-- Grant SELECT on the view to anon and authenticated roles
GRANT SELECT ON public.signage_projects_public TO anon, authenticated;