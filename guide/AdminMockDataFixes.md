# Admin Mock Data Fixes

I have rewritten [sample-data/admin-mock-data.sql](file:///d:/Buzzly_Dev/BuzzlyDev/sample-data/admin-mock-data.sql) to align with the current database schema.

## Changes Made

-   **Added `role_customers`**: To support workspace member roles (Owner, Admin, Editor, Viewer).
-   **Added `workspaces`**: Created a workspace for each team, as `team_members` has been replaced by `workspace_members`.
-   **Replaced `team_members` and `team_invitations`**:
    -   Combined these into `workspace_members`.
    -   Aligned column names (`workspace_id`, `role_customer_id` instead of string roles).
-   **Updated `platforms`**: Added `api_version` column to match schema.
-   **Fixed `teams`**: Removed potentially problematic columns if they don't exist (though kept standard ones) and ensured IDs map correctly to new workspaces.

## How to Apply

1.  Open the SQL Editor in Supabase (or your preferred client).
2.  Open [admin-mock-data.sql](file:///d:/Buzzly_Dev/BuzzlyDev/sample-data/admin-mock-data.sql).
3.  Run the entire script.

> [!NOTE]
> The script checks for conflicts (`ON CONFLICT DO NOTHING`) so it is safe to run even if some data already exists, provided the IDs match.

## Data Summary

The following data has been mocked in the database:

| Table | Count | Description |
| :--- | :--- | :--- |
| `role_customers` | 4 | Standard roles: Owner, Admin, Editor, Viewer |
| `business_types` | 8 | Industries like Technology, E-commerce, etc. |
| `industries` | 8 | Sectors like Software, Retail, etc. |
| `platforms` | 8 | Ad platforms: FB, Google, TikTok, etc. |
| `teams` | 8 | Example teams linked to the current user |
| `workspaces` | 8 | One workspace per team |
| `workspace_members` | 12 | 8 active owners, 4 pending invitations |
| `ad_accounts` | 16 | Ad accounts linked to teams/platforms |
| `error_logs` | 18 | Various error/warning/info logs for testing |
