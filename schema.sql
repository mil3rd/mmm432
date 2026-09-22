-- ============================================================
-- KNOW ME MORE — schema for Neon (plain Postgres)
-- Run with: psql "$DATABASE_URL" -f schema.sql
-- (or paste into the Neon SQL editor in the dashboard)
-- ============================================================

create extension if not exists pgcrypto; -- gives us gen_random_uuid()

-- ---------- PROFILE (single row, enforced) ----------
create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  display_name text,
  title text,
  bio text,
  profile_image text,
  location text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- PROJECTS ----------
create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text,
  category text,
  year text,
  role text,
  responsibilities text,
  tools text[],
  skills text[],
  cover_image text,
  external_url text,
  external_url_label text,
  is_featured boolean not null default false,
  status text not null default 'draft' check (status in ('draft', 'published')),
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists projects_status_order_idx
  on projects (status, display_order);

-- ---------- PROJECT IMAGES (gallery, optional per project) ----------
create table if not exists project_images (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  image_url text not null,
  display_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists project_images_project_idx
  on project_images (project_id, display_order);

-- ---------- SOCIAL LINKS ----------
create table if not exists social_links (
  id uuid primary key default gen_random_uuid(),
  platform text not null,        -- e.g. 'behance', 'linkedin', 'github'
  url text not null,
  display_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- ---------- SITE SETTINGS (single row, enforced) ----------
create table if not exists site_settings (
  id uuid primary key default gen_random_uuid(),
  phone text,
  email text,
  instagram text,
  updated_at timestamptz not null default now()
);

-- ============================================================
-- Enforce "only one row" for profiles / site_settings.
-- With Supabase this was paired with RLS; here there's exactly one
-- trusted server (your Next.js app, via DATABASE_URL) talking to
-- Neon, and the admin routes are gated by NextAuth instead — so the
-- security boundary moves from the database to the app layer.
-- ============================================================
create unique index if not exists profiles_singleton_idx
  on profiles ((true));

create unique index if not exists site_settings_singleton_idx
  on site_settings ((true));

-- ============================================================
-- updated_at auto-touch trigger
-- ============================================================
create or replace function touch_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_profiles_touch on profiles;
create trigger trg_profiles_touch before update on profiles
  for each row execute function touch_updated_at();

drop trigger if exists trg_projects_touch on projects;
create trigger trg_projects_touch before update on projects
  for each row execute function touch_updated_at();

drop trigger if exists trg_settings_touch on site_settings;
create trigger trg_settings_touch before update on site_settings
  for each row execute function touch_updated_at();
