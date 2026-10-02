-- Ensure media buckets exist and are publicly readable for the portfolio.
-- Run this in the Supabase SQL editor if thumbnails/videos still 400 after deploying the app.
-- The app also uses signed URLs, so private buckets with SELECT policies still work.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  (
    'project-thumbnails',
    'project-thumbnails',
    true,
    5242880,
    array['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
  ),
  (
    'project-videos',
    'project-videos',
    true,
    209715200,
    array['video/mp4', 'video/webm', 'video/quicktime']
  )
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Public read is required for portfolio thumbnails/videos on the anonymous site.
drop policy if exists "Public read thumbnails" on storage.objects;
create policy "Public read thumbnails"
on storage.objects for select
using ( bucket_id = 'project-thumbnails' );

drop policy if exists "Public read videos" on storage.objects;
create policy "Public read videos"
on storage.objects for select
using ( bucket_id = 'project-videos' );

drop policy if exists "Admin upload thumbnails" on storage.objects;
create policy "Admin upload thumbnails"
on storage.objects for insert
to authenticated
with check ( bucket_id = 'project-thumbnails' );

drop policy if exists "Admin update thumbnails" on storage.objects;
create policy "Admin update thumbnails"
on storage.objects for update
to authenticated
using ( bucket_id = 'project-thumbnails' );

drop policy if exists "Admin delete thumbnails" on storage.objects;
create policy "Admin delete thumbnails"
on storage.objects for delete
to authenticated
using ( bucket_id = 'project-thumbnails' );

drop policy if exists "Admin upload videos" on storage.objects;
create policy "Admin upload videos"
on storage.objects for insert
to authenticated
with check ( bucket_id = 'project-videos' );

drop policy if exists "Admin update videos" on storage.objects;
create policy "Admin update videos"
on storage.objects for update
to authenticated
using ( bucket_id = 'project-videos' );

drop policy if exists "Admin delete videos" on storage.objects;
create policy "Admin delete videos"
on storage.objects for delete
to authenticated
using ( bucket_id = 'project-videos' );
