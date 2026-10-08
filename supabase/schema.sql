create extension if not exists pgcrypto;

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null,
  type text not null default 'web' check (type in ('web', 'mobile')),
  technology text,
  description text,
  image_url text,
  project_url text,
  github_url text,
  status text not null default 'published' check (status in ('draft', 'published')),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.skills (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text,
  icon text,
  level integer default 0,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.experience (
  id uuid primary key default gen_random_uuid(),
  year text,
  period text,
  role text,
  company text,
  description text,
  skills text[] default '{}',
  focus text,
  stage text,
  type text,
  projects text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  category text,
  title text not null,
  description text,
  technologies text[] default '{}',
  icon text,
  color text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.services add column if not exists category text;
alter table public.services add column if not exists color text;

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  subject text,
  message text not null,
  status text not null default 'unread' check (status in ('unread', 'read')),
  created_at timestamptz not null default now()
);

alter table public.projects enable row level security;
alter table public.skills enable row level security;
alter table public.experience enable row level security;
alter table public.services enable row level security;
alter table public.contact_messages enable row level security;

create policy "Public can view published projects"
on public.projects
for select
using (status = 'published');

create policy "Public can view skills"
on public.skills
for select
using (true);

create policy "Public can view experience"
on public.experience
for select
using (true);

create policy "Public can view services"
on public.services
for select
using (true);

create policy "Public can insert contact messages"
on public.contact_messages
for insert
with check (true);

create policy "Public cannot read contact messages"
on public.contact_messages
for select
using (false);

create policy "Public cannot update contact messages"
on public.contact_messages
for update
using (false)
with check (false);

create policy "Public cannot delete contact messages"
on public.contact_messages
for delete
using (false);

create policy "Authenticated users can manage projects"
on public.projects
for all
using (auth.uid() is not null)
with check (auth.uid() is not null);

create policy "Authenticated users can manage skills"
on public.skills
for all
using (auth.uid() is not null)
with check (auth.uid() is not null);

create policy "Authenticated users can manage experience"
on public.experience
for all
using (auth.uid() is not null)
with check (auth.uid() is not null);

create policy "Authenticated users can manage services"
on public.services
for all
using (auth.uid() is not null)
with check (auth.uid() is not null);

create policy "Authenticated users can manage messages"
on public.contact_messages
for all
using (auth.uid() is not null)
with check (auth.uid() is not null);

create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger projects_updated_at
before update on public.projects
for each row execute function public.handle_updated_at();

create trigger experience_updated_at
before update on public.experience
for each row execute function public.handle_updated_at();

create policy "Storage project images are publicly readable"
on storage.objects for select
using (bucket_id = 'project-images');

create policy "Authenticated users can upload project images"
on storage.objects for insert
with check (bucket_id = 'project-images' and auth.uid() is not null);

create policy "Authenticated users can update project images"
on storage.objects for update
using (bucket_id = 'project-images' and auth.uid() is not null)
with check (bucket_id = 'project-images' and auth.uid() is not null);

create policy "Authenticated users can delete project images"
on storage.objects for delete
using (bucket_id = 'project-images' and auth.uid() is not null);

create bucket if not exists project-images;
