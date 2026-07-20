-- Run this in Supabase SQL Editor after creating the "item-photos" bucket

-- Anyone can view photos (bucket is public, but this makes read access explicit)
create policy "anyone can view item photos"
  on storage.objects for select
  using (bucket_id = 'item-photos');

-- Only logged-in users can upload, and only into their own folder
-- (we'll structure uploads as: item-photos/{user_id}/{filename})
create policy "authenticated users can upload their own photos"
  on storage.objects for insert
  with check (
    bucket_id = 'item-photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "users can delete their own photos"
  on storage.objects for delete
  using (
    bucket_id = 'item-photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
