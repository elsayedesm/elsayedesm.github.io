-- Create buckets in Dashboard: project-thumbnails, project-videos (public)

create policy "Public read thumbnails"
on storage.objects for select
using ( bucket_id = 'project-thumbnails' );

create policy "Admin upload thumbnails"
on storage.objects for insert
to authenticated
with check ( bucket_id = 'project-thumbnails' );

create policy "Admin update thumbnails"
on storage.objects for update
to authenticated
using ( bucket_id = 'project-thumbnails' );

create policy "Admin delete thumbnails"
on storage.objects for delete
to authenticated
using ( bucket_id = 'project-thumbnails' );

create policy "Public read videos"
on storage.objects for select
using ( bucket_id = 'project-videos' );

create policy "Admin upload videos"
on storage.objects for insert
to authenticated
with check ( bucket_id = 'project-videos' );

create policy "Admin update videos"
on storage.objects for update
to authenticated
using ( bucket_id = 'project-videos' );

create policy "Admin delete videos"
on storage.objects for delete
to authenticated
using ( bucket_id = 'project-videos' );
