
-- Check Workspaces and their Owners
SELECT id AS workspace_id, name AS workspace_name, owner_id FROM workspaces;

-- Check Ad Accounts and their Team IDs
SELECT id AS ad_account_id, account_name, team_id FROM ad_accounts;

-- Check if there is a match
SELECT 
    w.name AS workspace_name, 
    w.owner_id, 
    aa.account_name, 
    aa.id AS ad_account_id
FROM 
    workspaces w
JOIN 
    ad_accounts aa ON w.id = aa.team_id;
