-- Enable read access for rating table (Reference table, typically public or authenticated)
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.rating;
CREATE POLICY "Enable read access for authenticated users" ON public.rating
FOR SELECT
TO authenticated
USING (true);

-- Enable read access for feedback table (Owner/Admin only is best practice, but starting with authenticated for visibility)
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.feedback;
CREATE POLICY "Enable read access for authenticated users" ON public.feedback
FOR SELECT
TO authenticated
USING (true);
