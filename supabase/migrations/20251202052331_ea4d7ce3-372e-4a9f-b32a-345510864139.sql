-- Create user roles enum and table
create type public.app_role as enum ('customer', 'admin', 'owner');

-- User roles table
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null default 'customer',
  created_at timestamptz default now(),
  unique (user_id, role)
);

-- Enable RLS
alter table public.user_roles enable row level security;

-- Security definer function to check roles
create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = _user_id and role = _role
  )
$$;

-- User profiles table
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  company_name text,
  plan_type text default 'free',
  status text default 'active',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;

-- API Configurations table
create table public.api_configurations (
  id uuid primary key default gen_random_uuid(),
  platform text not null,
  client_id text,
  client_secret text,
  api_version text,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.api_configurations enable row level security;

-- Error Logs table
create table public.error_logs (
  id uuid primary key default gen_random_uuid(),
  level text not null,
  message text not null,
  request_id text,
  user_id uuid references auth.users(id) on delete set null,
  stack_trace text,
  metadata jsonb,
  created_at timestamptz default now()
);

alter table public.error_logs enable row level security;

-- System Health table
create table public.system_health (
  id uuid primary key default gen_random_uuid(),
  service_name text not null,
  service_type text not null,
  status text not null,
  uptime_percentage decimal,
  last_checked timestamptz default now(),
  response_time_ms integer,
  metadata jsonb
);

alter table public.system_health enable row level security;

-- AI Parameters table
create table public.ai_parameters (
  id uuid primary key default gen_random_uuid(),
  parameter_name text not null unique,
  parameter_value text not null,
  description text,
  updated_by uuid references auth.users(id),
  updated_at timestamptz default now()
);

alter table public.ai_parameters enable row level security;

-- RLS Policies for user_roles (only admins can view)
create policy "Admins can view all roles"
on public.user_roles for select
to authenticated
using (public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'owner'));

create policy "Admins can insert roles"
on public.user_roles for insert
to authenticated
with check (public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'owner'));

-- RLS Policies for profiles
create policy "Users can view own profile"
on public.profiles for select
to authenticated
using (auth.uid() = id);

create policy "Admins can view all profiles"
on public.profiles for select
to authenticated
using (public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'owner'));

create policy "Admins can update profiles"
on public.profiles for update
to authenticated
using (public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'owner'));

create policy "Users can update own profile"
on public.profiles for update
to authenticated
using (auth.uid() = id);

-- RLS Policies for api_configurations (admin only)
create policy "Admins can manage API configs"
on public.api_configurations for all
to authenticated
using (public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'owner'));

-- RLS Policies for error_logs (admin only)
create policy "Admins can view error logs"
on public.error_logs for select
to authenticated
using (public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'owner'));

create policy "Anyone can insert error logs"
on public.error_logs for insert
to authenticated
with check (true);

-- RLS Policies for system_health (admin only)
create policy "Admins can manage system health"
on public.system_health for all
to authenticated
using (public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'owner'));

-- RLS Policies for ai_parameters (admin only)
create policy "Admins can manage AI parameters"
on public.ai_parameters for all
to authenticated
using (public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'owner'));

-- Trigger for profile creation
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  
  -- Assign customer role by default
  insert into public.user_roles (user_id, role)
  values (new.id, 'customer');
  
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Function to update updated_at
create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger update_profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.update_updated_at_column();

create trigger update_api_configurations_updated_at
  before update on public.api_configurations
  for each row execute procedure public.update_updated_at_column();