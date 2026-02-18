-- Create customer_personas table for Buzzly users to store their customer personas
CREATE TABLE public.customer_personas (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    team_id UUID NOT NULL,
    
    -- Persona Identity
    persona_name VARCHAR(255) NOT NULL,
    description TEXT,
    avatar_url TEXT,
    
    -- Demographics
    gender_id UUID,
    age_min INTEGER,
    age_max INTEGER,
    location_id UUID,
    
    -- Professional Info (merged from customer_insights concept)
    profession VARCHAR(255),
    company_size VARCHAR(100), -- e.g., '1-10', '11-50', '51-200', '201-500', '500+'
    salary_range VARCHAR(100), -- e.g., 'Under 15k', '15k-30k', '30k-50k', '50k-100k', '100k+'
    industry VARCHAR(255),
    
    -- Behavioral Data
    preferred_devices TEXT[], -- e.g., ['mobile', 'desktop', 'tablet']
    active_hours VARCHAR(100), -- e.g., 'morning', 'afternoon', 'evening', 'night'
    interests TEXT[], -- e.g., ['technology', 'fashion', 'sports']
    pain_points TEXT[],
    goals TEXT[],
    
    -- Custom Fields (flexible JSON for user-defined attributes)
    custom_fields JSONB DEFAULT '{}',
    
    -- Metadata
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by UUID
);

-- Enable RLS
ALTER TABLE public.customer_personas ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Team members can access personas of their workspace
CREATE POLICY "Team members can view personas"
ON public.customer_personas FOR SELECT
USING (is_team_member(auth.uid(), team_id));

CREATE POLICY "Team members can create personas"
ON public.customer_personas FOR INSERT
WITH CHECK (is_team_member(auth.uid(), team_id));

CREATE POLICY "Team members can update personas"
ON public.customer_personas FOR UPDATE
USING (is_team_member(auth.uid(), team_id));

CREATE POLICY "Team admins can delete personas"
ON public.customer_personas FOR DELETE
USING (can_manage_team(auth.uid(), team_id));

-- Create trigger for updated_at
CREATE TRIGGER update_customer_personas_updated_at
BEFORE UPDATE ON public.customer_personas
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster team-based queries
CREATE INDEX idx_customer_personas_team_id ON public.customer_personas(team_id);
CREATE INDEX idx_customer_personas_is_active ON public.customer_personas(is_active);

-- Add comment for documentation
COMMENT ON TABLE public.customer_personas IS 'Stores custom customer personas created by Buzzly users for their workspace/business';