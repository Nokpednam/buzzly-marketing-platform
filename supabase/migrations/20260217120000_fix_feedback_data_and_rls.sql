-- 1. Fix RLS Policies (Ensure data is visible)
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.rating;
CREATE POLICY "Enable read access for authenticated users" ON public.rating FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.feedback;
CREATE POLICY "Enable read access for authenticated users" ON public.feedback FOR SELECT TO authenticated USING (true);

-- 2. Insert Sample Ratings if missing
INSERT INTO public.rating (name, icon_url, color_code, descriptions)
SELECT 'Excellent', 'star', '#22c55e', '5 Stars'
WHERE NOT EXISTS (SELECT 1 FROM public.rating LIMIT 1);

INSERT INTO public.rating (name, icon_url, color_code, descriptions)
SELECT 'Good', 'star', '#3b82f6', '4 Stars'
WHERE NOT EXISTS (SELECT 1 FROM public.rating WHERE name = 'Good');

INSERT INTO public.rating (name, icon_url, color_code, descriptions)
SELECT 'Average', 'star', '#eab308', '3 Stars'
WHERE NOT EXISTS (SELECT 1 FROM public.rating WHERE name = 'Average');

INSERT INTO public.rating (name, icon_url, color_code, descriptions)
SELECT 'Poor', 'star', '#f97316', '2 Stars'
WHERE NOT EXISTS (SELECT 1 FROM public.rating WHERE name = 'Poor');

INSERT INTO public.rating (name, icon_url, color_code, descriptions)
SELECT 'Terrible', 'star', '#ef4444', '1 Star'
WHERE NOT EXISTS (SELECT 1 FROM public.rating WHERE name = 'Terrible');

-- 3. Insert Sample Feedback if missing
DO $$
DECLARE
    r_5 uuid;
    r_4 uuid;
    r_1 uuid;
BEGIN
    SELECT id INTO r_5 FROM public.rating WHERE name = 'Excellent' LIMIT 1;
    SELECT id INTO r_4 FROM public.rating WHERE name = 'Good' LIMIT 1;
    SELECT id INTO r_1 FROM public.rating WHERE name = 'Terrible' LIMIT 1;

    IF NOT EXISTS (SELECT 1 FROM public.feedback LIMIT 1) THEN
        INSERT INTO public.feedback (rating_id, comment, created_at)
        VALUES 
            (r_5, 'Great platform! Really helps manage my business.', now() - interval '2 days'),
            (r_5, 'Love the new dashboard design.', now() - interval '5 days'),
            (r_4, 'Good features but needs more tutorials.', now() - interval '10 days'),
            (r_1, 'Had some issues with login initially.', now() - interval '15 days');
    END IF;
END $$;
