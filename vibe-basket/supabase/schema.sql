-- NF Vibe Check — database schema (PRD §6.3)
--
-- Security model: every table is written/read only from Next.js server
-- code (route handlers / server actions) using the Supabase *service role*
-- key. The browser never talks to Supabase directly, so there is no
-- client-side anon-key access to lock down with RLS policies here. If a
-- browser-side Supabase client is introduced later, add RLS before that
-- happens.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Keyword taxonomy (PRD §6.1) — the 50 canonical vibe keywords clients pick
-- from. Seeded by scripts/seed.ts, not hard-coded into migrations, so the
-- list stays easy to tune per the PRD's decision log (§10, item 1).
-- ---------------------------------------------------------------------------
create table if not exists keywords (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,          -- e.g. "minimal"
  label       text not null,                 -- e.g. "Minimal"
  group_name  text not null,                 -- e.g. "Mood" — display grouping only
  sort_order  int not null default 0,
  active      boolean not null default true,
  created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Images (PRD §6.3 "Image record")
-- ---------------------------------------------------------------------------
create table if not exists images (
  id                 uuid primary key default gen_random_uuid(),
  keywords           text[] not null default '{}',   -- 2-6 canonical keyword slugs
  custom_tags        text[] not null default '{}',   -- free-form extra tags
  image_url          text not null unique, -- lets ingestion scripts upsert idempotently
  thumbnail_url       text,
  source_platform    text not null check (source_platform in (
                       'arena',
                       'stock_unsplash',
                       'stock_pexels',
                       'stock_adobe',
                       'ai_generated',
                       'manual_savee',
                       'manual_same_energy',
                       'manual_cosmos',
                       'manual_pinterest',
                       'in_house',
                       'placeholder_dev'   -- dev-only seed data, never in production
                     )),
  source_url         text,        -- required (enforced in app code) for arena/manual_*
  usage_mode         text not null check (usage_mode in ('hotlinked', 'stored_copy')),
  generation_prompt  text,        -- set for ai_generated
  license_credit     text,
  active             boolean not null default true,
  created_at         timestamptz not null default now()
);

create index if not exists images_keywords_gin on images using gin (keywords);
create index if not exists images_active_idx on images (active);

-- ---------------------------------------------------------------------------
-- Sessions (PRD §6.3 "Session record")
-- v1 decision (§10 item 5): one link = one respondent. The schema still
-- allows many respondents per session so Phase-3 multi-respondent links
-- aren't a migration; app code enforces the 1:1 rule for now.
-- ---------------------------------------------------------------------------
create table if not exists sessions (
  id            uuid primary key default gen_random_uuid(),
  admin_id      uuid,                 -- Supabase auth user id of the creator
  project_name  text,                 -- optional, admin's own organization label
  share_token   text not null unique,
  status        text not null default 'not_started' check (status in (
                  'not_started', 'in_progress', 'completed'
                )),
  created_at    timestamptz not null default now()
);

create index if not exists sessions_share_token_idx on sessions (share_token);

-- ---------------------------------------------------------------------------
-- Respondents (PRD §6.3 "Respondent record")
-- ---------------------------------------------------------------------------
create table if not exists respondents (
  id                  uuid primary key default gen_random_uuid(),
  session_id          uuid not null references sessions (id) on delete cascade,
  name                text not null,
  email               text,
  phone               text,
  brand_name          text not null,
  chosen_keywords     text[] not null,       -- exactly 3 canonical slugs (app-enforced)
  custom_keyword_text text,
  deck_size           int not null check (deck_size in (10, 25, 40, 50, 75)),
  completed_at        timestamptz,
  created_at          timestamptz not null default now(),
  constraint respondent_has_contact check (email is not null or phone is not null)
);

create index if not exists respondents_session_idx on respondents (session_id);

-- ---------------------------------------------------------------------------
-- Swipes — normalized out of the Respondent record's `swipes[]` for easy
-- querying/analytics, rather than a jsonb blob.
-- ---------------------------------------------------------------------------
create table if not exists swipes (
  id             uuid primary key default gen_random_uuid(),
  respondent_id  uuid not null references respondents (id) on delete cascade,
  image_id       uuid not null references images (id),
  direction      text not null check (direction in ('like', 'pass')),
  created_at     timestamptz not null default now(),
  unique (respondent_id, image_id)
);

create index if not exists swipes_respondent_idx on swipes (respondent_id);

-- ---------------------------------------------------------------------------
-- Summaries (PRD §6.3 "Summary record" + §7)
-- ---------------------------------------------------------------------------
create table if not exists summaries (
  respondent_id    uuid primary key references respondents (id) on delete cascade,
  liked_image_ids  uuid[] not null default '{}',
  summary_text     text not null,
  tag_frequency    jsonb not null default '{}',
  generated_at     timestamptz not null default now()
);
