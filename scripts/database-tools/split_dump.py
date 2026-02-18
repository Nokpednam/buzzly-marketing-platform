import re
import os

# Determine paths relative to this script location
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
# Assuming script is in scripts/database-tools/ (2 levels deep)
PROJECT_ROOT = os.path.abspath(os.path.join(SCRIPT_DIR, "../../"))

dump_file = os.path.join(SCRIPT_DIR, 'current_schema_dump.sql')
schema_file = os.path.join(PROJECT_ROOT, 'supabase/migrations/20260218000000_consolidated_schema.sql')
rls_file = os.path.join(PROJECT_ROOT, 'supabase/migrations/20260218000001_consolidated_rls.sql')

# System schemas to filter out
SYSTEM_SCHEMAS = {
    "_realtime", "auth", "extensions", "graphql", "graphql_public", "pgbouncer", 
    "realtime", "storage", "supabase_functions", "supabase_migrations", "vault", "cron", "net"
}

def get_effective_command(statement):
    """
    Returns the first line of the statement that is not a comment.
    """
    for line in statement.splitlines():
        stripped = line.strip()
        if not stripped: continue
        if stripped.startswith('--'): continue
        return stripped.lower()
    return ""

def is_system_object(statement):
    """
    Check if the statement defines or modifies an object in a system schema.
    """
    cmd = get_effective_command(statement)
    if not cmd: return False # Comment-only block usually safe to write or ignore, handled by logic

    # Normalize full statement for body checks
    full_stm = " ".join(statement.split()).lower()
    
    # 1. EXPLICIT ALLOWLIST FOR PUBLIC SCHEMA OBJECTS
    # If the effective command starts with creating/altering something in public, allowed.
    # Note: cmd is already lowercased from get_effective_command
    if "public." in cmd and (
        cmd.startswith("create table public.") or
        cmd.startswith("create function public.") or
        cmd.startswith("create view public.") or
        cmd.startswith("create materialized view public.") or
        cmd.startswith("create type public.") or
        cmd.startswith("alter table public.") or
        cmd.startswith("alter function public.") or
        cmd.startswith("alter type public.") or 
        ("create trigger" in cmd and "on public." in cmd)
    ):
        return False
    
    # 2. Check for CREATE/ALTER/COMMENT/GRANT/REVOKE on system schemas
    # We use full_stm for body checks sometimes, but mostly concerned with target
    
    for schema in SYSTEM_SCHEMAS:
        # Patterns to look for in the command target specifically would be better
        # but robust containment check usually works if we excluded public.
        
        pattern = f"{schema}."
        pattern_quoted = f'"{schema}".'
        
        # Check specific schema actions
        is_schema_action = (
            f"create schema {schema}" in full_stm or 
            f"create schema \"{schema}\"" in full_stm or
            f"alter schema {schema}" in full_stm or
            f"grant usage on schema {schema}" in full_stm or
            f"grant all on schema {schema}" in full_stm or
            f"in schema {schema}" in full_stm or
            f"in schema \"{schema}\"" in full_stm
        )
        
        if f" {pattern}" in full_stm or f" {pattern_quoted}" in full_stm or \
           full_stm.startswith(f"create schema {schema}") or \
           full_stm.startswith(f"create schema \"{schema}\"") or \
           full_stm.startswith(f"alter schema {schema}") or \
           is_schema_action:
            return True
            
    return False

def is_safe_trigger(statement):
    """
    Exception for triggers on system tables that execute public functions.
    e.g. CREATE TRIGGER on_auth_user_created ... ON auth.users ... EXECUTE FUNCTION public.handle_new_user();
    """
    stm = " ".join(statement.split()).lower()
    # Check for trigger on auth.users or storage.objects calling public function
    if "create trigger" in stm and \
       ("on auth.users" in stm or "on storage.objects" in stm) and \
       "public." in stm:
        return True
    return False

def write_statement(statement, f_schema, f_rls):
    stripped = statement.strip()
    if not stripped: return
    
    cmd = get_effective_command(statement)
    # If it's just comments, cmd is empty. 
    # Let's write them to schema file to preserve context/headers if they aren't filtered.
    if not cmd:
        f_schema.write(statement + "\n")
        return

    # Filter out psql meta-commands
    if stripped.startswith("\\"): return

    # Filter out Event Triggers
    if "event trigger" in cmd:
        return

    # Filter out COMMENT ON EXTENSION
    if cmd.startswith("comment on extension"):
        return

    # Filter out publication creation for system publications
    if "publication" in cmd and "supabase_realtime" in cmd:
        return

    # Filter out GRANTS on pg_catalog
    if "grant" in cmd and "pg_catalog" in cmd:
        return

    # Filter out ALTER DEFAULT PRIVILEGES for system roles
    # e.g. ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin ...
    if "alter default privileges" in cmd and (
        "supabase_admin" in cmd or 
        "supabase_auth_admin" in cmd or 
        "supabase_storage_admin" in cmd or
        "postgres" in cmd # Often these are system defaults we don't need to replicate if we are not superuser
    ):
        return

    # RLS Policies
    if cmd.startswith("create policy") or \
       ("enable row level security" in statement.lower() and cmd.startswith("alter table")) or \
       ("force row level security" in statement.lower() and cmd.startswith("alter table")) or \
       "type: policy" in statement.lower():
        
        # Check if it targets a system schema
        # Simple check: does it contain " on system_schema." or "alter table system_schema."
        is_system_rls = False
        full_stm = " ".join(statement.split()).lower()
        
        for schema in SYSTEM_SCHEMAS:
            # For policies: ON schema.table
            # For alter table: ALTER TABLE schema.table
            
            # Note: storage is in SYSTEM_SCHEMAS.
            # Users often creating policies on storage.objects.
            # We should ALLOW Create Policy on storage, but maybe NOT Enable RLS?
            # Actually, Enable RLS on storage.objects usually fails if not owner.
            
            # Logic:
            # 1. Block ENABLE/FORCE RLS on ALL system schemas (it's their job to manage it)
            if ("enable row level security" in full_stm or "force row level security" in full_stm) and \
               (f" {schema}." in full_stm or f" \"{schema}\"." in full_stm):
                is_system_rls = True
                break
                
            # 2. Block CREATE POLICY on internal schemas (auth, realtime, etc) 
            # BUT allow storage?
            # Let's block auth, realtime, extensions, etc.
            # Allow 'storage' for custom policies? 
            # BE CAREFUL: split_dump.py puts ALL policies in rls_file.
            
            if cmd.startswith("create policy") and schema != 'storage' and \
               (f" on {schema}." in full_stm or f" on \"{schema}\"." in full_stm):
                 is_system_rls = True
                 break
        
        if not is_system_rls:
            f_rls.write(statement + "\n")
        return

    # System Object Filtering
    if is_system_object(statement):
        if is_safe_trigger(statement):
            f_schema.write(statement + "\n")
        return

    # Extension creation?
    if cmd.startswith("create extension"):
        # Skip extensions entirely
        return

    # Standard Schema DDL
    f_schema.write(statement + "\n")

def split_sql_dump():
    with open(dump_file, 'r') as f_in, \
         open(schema_file, 'w') as f_schema, \
         open(rls_file, 'w') as f_rls:

        f_schema.write("-- Consolidated Schema (DDL)\n")
        f_rls.write("-- Consolidated RLS Policies\n")

        lines = f_in.readlines()
        
        buffer = []
        in_dollar_block = False
        dollar_tag = "$$" 
        
        for line in lines:
            stripped = line.strip()
            if not buffer and not stripped: continue
            
            # Pre-check for psql meta-commands to avoid buffering them
            if stripped.startswith("\\"):
                continue
                
            buffer.append(line)
            current_stm = "".join(buffer) # Full statement so far
            
            # Terminator detection logic
            if not in_dollar_block:
                # Check if we are entering a dollar block
                # Looking for $tag$ at end of line or before ;
                # e.g. AS $$
                # e.g. AS $func$
                
                # Regex to find last occurrence of $...$ on the line
                matches = re.findall(r'(\$[a-zA-Z0-9_]*\$)', stripped)
                if matches:
                    pending_tag = matches[-1]
                    # Only treat as block start if it's part of a definition context or just safer to assume yes?
                    # pg_dump usually puts: AS $$ ...
                    in_dollar_block = True
                    dollar_tag = pending_tag
                
                elif stripped.endswith(';'):
                    # End of standard statement
                    write_statement(current_stm, f_schema, f_rls)
                    buffer = []
            
            else:
                # Inside dollar block, look for closing tag + ;
                # e.g. $$;
                terminator = f"{dollar_tag};"
                if stripped.endswith(terminator):
                    in_dollar_block = False
                    write_statement(current_stm, f_schema, f_rls)
                    buffer = []

        # Process mostly empty buffer if remaining
        if buffer:
            write_statement("".join(buffer), f_schema, f_rls)

    print("Split complete.")

if __name__ == "__main__":
    split_sql_dump()
