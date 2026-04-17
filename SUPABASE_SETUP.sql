-- Run this SQL in your Supabase dashboard > SQL Editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Leads table
create table if not exists public.leads (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  contact_person text,
  location text,
  phone text,
  email text,
  website_status text,
  website_url text,
  last_call timestamptz,
  call_outcome text,
  next_follow_up date,
  status text not null default 'new' check (status in ('new', 'contacted', 'follow-up', 'hot', 'closed')),
  demo_link text,
  created_at timestamptz not null default now()
);

-- Notes table (call history)
create table if not exists public.notes (
  id uuid primary key default uuid_generate_v4(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  content text not null default '',
  outcome text not null,
  created_at timestamptz not null default now()
);

-- Indexes for performance
create index if not exists leads_status_idx on public.leads(status);
create index if not exists leads_next_follow_up_idx on public.leads(next_follow_up);
create index if not exists notes_lead_id_idx on public.notes(lead_id);
create index if not exists notes_created_at_idx on public.notes(created_at);

-- Enable Row Level Security
alter table public.leads enable row level security;
alter table public.notes enable row level security;

-- RLS Policies: only authenticated users can access data
create policy "Authenticated users can manage leads"
  on public.leads for all
  to authenticated
  using (true)
  with check (true);

create policy "Authenticated users can manage notes"
  on public.notes for all
  to authenticated
  using (true)
  with check (true);

-- Enable Realtime for live updates
alter publication supabase_realtime add table public.leads;
alter publication supabase_realtime add table public.notes;
