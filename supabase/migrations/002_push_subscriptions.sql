-- Notifications push Web (PWA iOS 16.4+ / Android / desktop).
-- Exécuter dans Supabase → SQL Editor après 001_data_buckets.sql.

create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  endpoint text not null,
  p256dh text not null,
  auth_key text not null,
  last_notified_at timestamptz,
  last_digest text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, endpoint)
);

create index if not exists push_subscriptions_user_id_idx on public.push_subscriptions (user_id);

alter table public.push_subscriptions enable row level security;

create policy "Users read own push subscriptions"
  on public.push_subscriptions for select
  using (auth.uid() = user_id);

create policy "Users insert own push subscriptions"
  on public.push_subscriptions for insert
  with check (auth.uid() = user_id);

create policy "Users update own push subscriptions"
  on public.push_subscriptions for update
  using (auth.uid() = user_id);

create policy "Users delete own push subscriptions"
  on public.push_subscriptions for delete
  using (auth.uid() = user_id);
