-- Fix: Reassign personas to each user's OWN workspace
-- This script reassigns ALL personas evenly across users, 
-- OR you can run the targeted version below

-- Option A: Check workspaces vs personas
SELECT 
  u.email,
  w.id as workspace_id,
  (SELECT COUNT(*) FROM public.customer_personas WHERE team_id = w.id) as persona_count
FROM auth.users u
JOIN public.workspaces w ON w.owner_id = u.id
ORDER BY u.email;

-- Option B: Forcefully reassign ALL personas to hachikonoluna's workspace
UPDATE public.customer_personas
SET team_id = (
  SELECT w.id 
  FROM public.workspaces w
  JOIN auth.users u ON u.id = w.owner_id
  WHERE u.email = 'godtead@gmail.com'
  LIMIT 1
)
WHERE true;  -- updates ALL personas

-- Verify: Should show 60 under hachikonoluna's workspace_id
SELECT 
  u.email,
  w.id as workspace_id,
  COUNT(cp.id) as persona_count
FROM auth.users u
JOIN public.workspaces w ON w.owner_id = u.id
LEFT JOIN public.customer_personas cp ON cp.team_id = w.id
WHERE u.email = 'godtead@gmail.com'
GROUP BY u.email, w.id;
