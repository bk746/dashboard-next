-- Exécuter ce script dans Supabase → SQL Editor (ou via CLI) après création du projet.
-- Active la persistance cloud pour FinPilot (auth + RLS par utilisateur).

create table if not exists public.data_buckets (
  user_id uuid not null references auth.users on delete cascade,
  bucket_key text not null,
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (user_id, bucket_key)
);

create index if not exists data_buckets_user_id_idx on public.data_buckets (user_id);

alter table public.data_buckets enable row level security;

create policy "Users read own buckets"
  on public.data_buckets for select
  using (auth.uid() = user_id);

create policy "Users insert own buckets"
  on public.data_buckets for insert
  with check (auth.uid() = user_id);

create policy "Users update own buckets"
  on public.data_buckets for update
  using (auth.uid() = user_id);

create policy "Users delete own buckets"
  on public.data_buckets for delete
  using (auth.uid() = user_id);
