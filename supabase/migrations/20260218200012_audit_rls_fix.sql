-- Allow unauthenticated inserts for audit logs (specifically for failed logins)
create policy "Enable insert for authentication events"
on public.audit_logs_enhanced
for insert
with check (
  category = 'authentication'
);

-- Ensure anon role has permission to insert
grant insert on public.audit_logs_enhanced to anon;
