-- Projects
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  thumbnail_url text not null,
  video_url text,
  video_type text not null check (video_type in ('upload', 'url')),
  project_date date,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists projects_updated_at on public.projects;
create trigger projects_updated_at
  before update on public.projects
  for each row execute function public.set_updated_at();

-- Contact messages
create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  message text not null default '',
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.projects enable row level security;
alter table public.contact_messages enable row level security;

-- Public: read published projects
create policy "Public read published projects"
  on public.projects for select
  using (is_published = true);

-- Authenticated admin: full projects access
create policy "Admin manage projects"
  on public.projects for all
  to authenticated
  using (true)
  with check (true);

-- Public: insert contact messages only
create policy "Public insert contact messages"
  on public.contact_messages for insert
  to anon, authenticated
  with check (true);

-- Admin: read/update/delete messages
create policy "Admin manage contact messages"
  on public.contact_messages for select
  to authenticated
  using (true);

create policy "Admin update contact messages"
  on public.contact_messages for update
  to authenticated
  using (true)
  with check (true);

create policy "Admin delete contact messages"
  on public.contact_messages for delete
  to authenticated
  using (true);

-- Storage buckets (run in Supabase Dashboard or via API):
-- project-thumbnails (public read)
-- project-videos (public read)
