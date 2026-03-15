-- Clear existing "Default workspace" descriptions from the database
UPDATE workspaces 
SET description = '' 
WHERE description LIKE 'Default workspace%';
