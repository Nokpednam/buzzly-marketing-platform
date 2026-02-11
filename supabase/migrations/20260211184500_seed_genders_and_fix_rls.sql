-- Seed genders table and ensure public read access

-- 1. Enable RLS
ALTER TABLE public.genders ENABLE ROW LEVEL SECURITY;

-- 2. Create policy for public read access (Anonymous + Authenticated)
DROP POLICY IF EXISTS "Allow public read access" ON public.genders;

CREATE POLICY "Allow public read access"
ON public.genders FOR SELECT
TO anon, authenticated
USING (true);

-- 3. Seed Data
-- Using ON CONFLICT logic with a temporary unique index or just checking existence to avoid duplicates

DO $$
BEGIN
    -- Insert Male
    IF NOT EXISTS (SELECT 1 FROM public.genders WHERE name_gender = 'Male') THEN
        INSERT INTO public.genders (name_gender) VALUES ('Male');
    END IF;

    -- Insert Female
    IF NOT EXISTS (SELECT 1 FROM public.genders WHERE name_gender = 'Female') THEN
        INSERT INTO public.genders (name_gender) VALUES ('Female');
    END IF;

    -- Insert LGBTQ+
    IF NOT EXISTS (SELECT 1 FROM public.genders WHERE name_gender = 'LGBTQ+') THEN
        INSERT INTO public.genders (name_gender) VALUES ('LGBTQ+');
    END IF;

    -- Insert Prefer not to say
    IF NOT EXISTS (SELECT 1 FROM public.genders WHERE name_gender = 'Prefer not to say') THEN
        INSERT INTO public.genders (name_gender) VALUES ('Prefer not to say');
    END IF;
END $$;
