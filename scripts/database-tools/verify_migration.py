import sys
import os

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(SCRIPT_DIR, "../../"))

schema_file = os.path.join(PROJECT_ROOT, 'supabase/migrations/20260218000000_consolidated_schema.sql')

FORBIDDEN_PATTERNS = [
    (r'^\s*\\', "PSQL Meta-command"),
    (r'CREATE SCHEMA .*_realtime', "System Schema Creation"),
    (r'CREATE SCHEMA .*auth', "System Schema Creation"),
    (r'CREATE SCHEMA .*extensions', "System Schema Creation"),
    (r'CREATE SCHEMA .*storage', "System Schema Creation"),
    (r'COMMENT ON EXTENSION', "Extension Comment"),
    (r'EVENT TRIGGER', "Event Trigger"),
    (r'CREATE TYPE auth\.', "Auth Type Creation"),
    (r'CREATE TABLE auth\.', "Auth Table Creation"),
    (r'CREATE FUNCTION auth\.', "Auth Function Creation"),
    (r'CREATE VIEW auth\.', "Auth View Creation"),
    (r'GRANT .* ON SCHEMA cron', "Cron Schema Grant"),
    (r'GRANT .* ON SCHEMA net', "Net Schema Grant"),
    (r'CREATE PUBLICATION supabase_realtime', "Realtime Publication Creation"),
    (r'GRANT .* ON FUNCTION pg_catalog', "PG Catalog Grant"),
    (r'ALTER DEFAULT PRIVILEGES .* IN SCHEMA auth', "Auth Default Privileges"),
    (r'ALTER DEFAULT PRIVILEGES .* ROLE supabase_admin', "Supabase Admin Default Privileges"),
    (r'ALTER DEFAULT PRIVILEGES .* ROLE supabase_auth_admin', "Auth Admin Default Privileges"),
    (r'ALTER TABLE auth\..* ENABLE ROW LEVEL SECURITY', "Auth Table RLS Enablement"),
]

def verify():
    print(f"Verifying {schema_file}...")
    errors_found = False
    
    try:
        with open(schema_file, 'r') as f:
            lines = f.readlines()
            
        for i, line in enumerate(lines):
            line_stripped = line.strip()
            
            for pattern, reason in FORBIDDEN_PATTERNS:
                import re
                if re.search(pattern, line_stripped, re.IGNORECASE):
                    # Exception for triggers on auth.users
                    if "CREATE TRIGGER" in line_stripped.upper() and "auth." in line_stripped.lower():
                        continue
                        
                    print(f"❌ Error at line {i+1}: Found {reason}")
                    print(f"   Content: {line_stripped[:100]}...")
                    errors_found = True
                    
    except FileNotFoundError:
        print(f"❌ Error: File {schema_file} not found.")
        sys.exit(1)
        
    if errors_found:
        print("\nVerification FAILED. Please fix the issues above.")
        sys.exit(1)
    else:
        print("\n✅ Verification PASSED. No forbidden patterns found.")

if __name__ == "__main__":
    verify()
