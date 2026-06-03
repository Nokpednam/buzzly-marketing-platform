-- ============================================================================
-- Migration: Add missing loyalty_missions table
-- Timestamp: 20260531000000
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.loyalty_missions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    action_type TEXT UNIQUE NOT NULL,
    label TEXT NOT NULL,
    points_awarded INTEGER NOT NULL DEFAULT 0,
    is_one_time BOOLEAN DEFAULT true,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.loyalty_missions OWNER TO postgres;

-- Seed default missions to match UI buttons
INSERT INTO public.loyalty_missions (action_type, label, points_awarded, is_one_time, is_active)
VALUES
    ('create_workspace', 'Create Your Workspace', 50, true, true),
    ('connect_api', 'Connect an Ad Platform API', 100, true, true),
    ('create_campaign', 'Launch Your First Campaign', 50, true, true)
ON CONFLICT (action_type) DO NOTHING;

NOTIFY pgrst, 'reload schema';
