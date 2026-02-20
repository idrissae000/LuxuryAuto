create extension if not exists "pgcrypto";

create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null,
  name text not null,
  email text not null,
  phone text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null,
  name text not null,
  description text not null default '',
  base_price_cents integer not null check (base_price_cents >= 0),
  duration_minutes integer not null check (duration_minutes > 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.addons (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null,
  name text not null,
  price_cents integer not null check (price_cents >= 0),
  extra_minutes integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null,
  customer_id uuid not null references public.customers(id) on delete cascade,
  service_id uuid not null references public.services(id),
  vehicle_size text not null check (vehicle_size in ('Sedan','SUV','Truck')),
  scheduled_start timestamptz not null,
  scheduled_end timestamptz not null,
  address text,
  notes text,
  internal_notes text,
  assigned_tech text,
  status text not null default 'scheduled' check (status in ('scheduled','in_progress','completed','canceled')),
  estimated_total_cents integer not null default 0,
  final_total_cents integer,
  google_event_id text,
  created_at timestamptz not null default now()
);

create index if not exists idx_customers_owner_id on public.customers(owner_id);
create index if not exists idx_services_owner_id on public.services(owner_id);
create index if not exists idx_addons_owner_id on public.addons(owner_id);
create index if not exists idx_bookings_owner_id on public.bookings(owner_id);
create index if not exists idx_bookings_scheduled_start on public.bookings(scheduled_start);
create index if not exists idx_bookings_status on public.bookings(status);

alter table public.customers enable row level security;
alter table public.services enable row level security;
alter table public.addons enable row level security;
alter table public.bookings enable row level security;

create policy "customers_owner_crud" on public.customers for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "services_owner_crud" on public.services for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "addons_owner_crud" on public.addons for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "bookings_owner_crud" on public.bookings for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());

create or replace function public.seed_default_catalog(p_owner_id uuid)
returns void
language plpgsql
security definer
as $$
begin
  insert into public.services (id, owner_id, name, description, base_price_cents, duration_minutes)
  values
    ('11111111-1111-1111-1111-111111111111', p_owner_id, 'Interior Detail', 'Deep clean of seats, carpets, dashboard, and interior surfaces.', 16000, 120),
    ('22222222-2222-2222-2222-222222222222', p_owner_id, 'Exterior Detail', 'Foam wash, decontamination, hand dry, and premium wax seal.', 14000, 90),
    ('33333333-3333-3333-3333-333333333333', p_owner_id, 'Full Vehicle Detail', 'Complete interior + exterior transformation.', 28500, 210)
  on conflict (id) do nothing;

  insert into public.addons (id, owner_id, name, price_cents, extra_minutes)
  values
    ('aaaaaaa4-aaaa-aaaa-aaaa-aaaaaaaaaaa4', p_owner_id, 'Odor Removal', 1500, 15)
  on conflict (id) do nothing;
end;
$$;
