-- Create reports bucket
insert into storage.buckets (id, name, public)
values ('reports', 'reports', true)
on conflict (id) do nothing;



-- Policies for reports bucket
create policy "Reports are publicly accessible"
  on storage.objects for select
  using ( bucket_id = 'reports' );

create policy "Users can upload reports"
  on storage.objects for insert
  with check ( bucket_id = 'reports' AND auth.role() = 'authenticated' );

create policy "Users can update own reports"
  on storage.objects for update
  using ( bucket_id = 'reports' AND auth.uid() = owner )
  with check ( bucket_id = 'reports' AND auth.uid() = owner );

create policy "Users can delete own reports"
  on storage.objects for delete
  using ( bucket_id = 'reports' AND auth.uid() = owner );
