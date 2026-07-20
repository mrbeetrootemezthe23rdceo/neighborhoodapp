-- ToolShare v1 schema
-- Run this in Supabase's SQL Editor (Project > SQL Editor > New query)

-- 1. Residents (profile info, linked 1:1 to Supabase auth users)
create table residents (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  apartment_no text not null,
  phone text,
  created_at timestamptz default now()
);

-- 2. Items available to borrow (or requested, via listing_type)
create table items (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references residents(id) on delete cascade,
  title text not null,
  description text,
  category text not null,
  condition text,
  photo_url text,
  listing_type text not null default 'offer'
    check (listing_type in ('offer', 'request')),
  created_at timestamptz default now()
);

-- 3. Conversations (one per borrow request thread)
create table conversations (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references items(id) on delete cascade,
  requester_id uuid not null references residents(id) on delete cascade,
  owner_id uuid not null references residents(id) on delete cascade,
  created_at timestamptz default now()
);

-- 4. Messages within a conversation
create table messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references conversations(id) on delete cascade,
  sender_id uuid not null references residents(id) on delete cascade,
  body text not null,
  created_at timestamptz default now()
);

-- Auto-create a "residents" row whenever someone signs up.
-- name/apartment_no start empty and get filled in on a "complete your profile" step.
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.residents (id, name, apartment_no)
  values (new.id, '', '');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Row Level Security: since anyone with the anon key can otherwise query
-- everything, RLS restricts what each request is allowed to see/do.
alter table residents enable row level security;
alter table items enable row level security;
alter table conversations enable row level security;
alter table messages enable row level security;

-- Residents: anyone logged in can view all profiles (needed to show
-- "listed by Jane, apt 3B"), but you can only edit your own.
create policy "residents are viewable by authenticated users"
  on residents for select using (auth.role() = 'authenticated');
create policy "users can update own profile"
  on residents for update using (auth.uid() = id);

-- Items: anyone logged in can view all items; only the owner can create/edit/delete theirs.
create policy "items are viewable by authenticated users"
  on items for select using (auth.role() = 'authenticated');
create policy "users can insert their own items"
  on items for insert with check (auth.uid() = owner_id);
create policy "users can update their own items"
  on items for update using (auth.uid() = owner_id);
create policy "users can delete their own items"
  on items for delete using (auth.uid() = owner_id);

-- Conversations: only the two participants can see or create a thread.
create policy "participants can view their conversations"
  on conversations for select
  using (auth.uid() = requester_id or auth.uid() = owner_id);
create policy "requester can start a conversation"
  on conversations for insert
  with check (auth.uid() = requester_id);

-- Messages: only participants of the parent conversation can read/send.
create policy "participants can view messages"
  on messages for select
  using (
    exists (
      select 1 from conversations c
      where c.id = conversation_id
      and (auth.uid() = c.requester_id or auth.uid() = c.owner_id)
    )
  );
create policy "participants can send messages"
  on messages for insert
  with check (
    auth.uid() = sender_id
    and exists (
      select 1 from conversations c
      where c.id = conversation_id
      and (auth.uid() = c.requester_id or auth.uid() = c.owner_id)
    )
  );
