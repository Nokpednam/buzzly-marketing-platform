    INSERT INTO public.team_members (team_id, user_id, status, joined_at)
    SELECT t.id, t.owner_id, 'active'::member_status, (NOW() - (random() * INTERVAL '6 months'))
    FROM public.teams t
    WHERE t.owner_id IS NOT NULL
    ON CONFLICT (team_id, user_id) DO NOTHING;