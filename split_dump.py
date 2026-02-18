
import re

dump_file = 'current_schema_dump.sql'
schema_file = 'supabase/migrations/20260218000000_consolidated_schema.sql'
rls_file = 'supabase/migrations/20260218000001_consolidated_rls.sql'

with open(dump_file, 'r') as f_in, \
     open(schema_file, 'w') as f_schema, \
     open(rls_file, 'w') as f_rls:

    # Write headers
    f_schema.write("-- Consolidated Schema (DDL)\n")
    f_rls.write("-- Consolidated RLS Policies\n")
    
    # Simple line-based processing
    # pg_dump usually outputs one statement per line or handles blocks well
    # We will assume CREATE POLICY and ENABLE ROW LEVEL SECURITY lines are distinct
    
    lines = f_in.readlines()
    
    # We want to catch the comments preceding the policies too, but it's hard to be perfect.
    # Let's just strip the specific commands for RLS.
    
    for line in lines:
        # Check for RLS commands
        is_policy = line.strip().startswith("CREATE POLICY")
        is_enable_rls = "ENABLE ROW LEVEL SECURITY" in line and line.strip().startswith("ALTER TABLE")
        is_force_rls = "FORCE ROW LEVEL SECURITY" in line and line.strip().startswith("ALTER TABLE")
        
        # Filter out psql meta-commands (like \restrict, \connect, etc.) which might appear in some dumps
        if line.strip().startswith("\\"):
            continue

        if is_policy or is_enable_rls or is_force_rls:
            f_rls.write(line)
        else:
            # We filter out "SET row_security = off;" from schema to avoid conflicts? 
            # No, keep it.
            
            # Filter out some noise if needed, but safe to keep most.
            # Check for comments that clearly belong to policies?
            # e.g., "-- Name: ... Type: POLICY"
            if "Type: POLICY" in line or "Type: ACL" in line:
               # Maybe put in RLS? Or just ignore comments. 
               # Let's write them to RLS if they look like Policy metadata
               if "Type: POLICY" in line:
                   f_rls.write(line)
               else:
                   f_schema.write(line)
            else:
               f_schema.write(line)

print("Split complete.")
