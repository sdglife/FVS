# NF Vibe Check

Client onboarding swipe tool: a creator shares one link, the client
registers, picks 3 vibe keywords (from a curated 50, or their own), swipes
right/left through a matching image deck, and the creator gets back the
liked gallery plus an AI-written style brief. Full product spec: [`PRD.md`](./PRD.md).

Built with Next.js (App Router) + Supabase + the Anthropic API, per the
PRD's locked stack decision (§9).

## Setup

```bash
npm install
cp .env.example .env.local   # fill in the values below
```

1. **Supabase**: create a project, run `supabase/schema.sql` against it
   (SQL editor, or `supabase db execute -f supabase/schema.sql` with the
   CLI), then set `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`.
2. **Admin login**: set `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and `AUTH_SECRET`
   (`openssl rand -hex 32`). This is a single-creator v1 (PRD §10) — a
   signed-cookie password gate, not Supabase Auth, so there's no email
   delivery to configure just to sign in.
3. **Summary generation**: set `ANTHROPIC_API_KEY`.
4. **Image sources** (PRD §5/§5.1) — set what you have, run the rest later:
   - `ARENA_ACCESS_TOKEN` — Are.na, the one platform with a real public API.
   - `UNSPLASH_ACCESS_KEY` / `PEXELS_API_KEY` — licensed stock.
   - `AI_IMAGE_PROVIDER=openai` + `AI_IMAGE_API_KEY` — AI-generated fill-in.

Then:

```bash
npm run seed    # keyword taxonomy + picsum.photos placeholder images, dev only
npm run dev
```

Visit `/admin`, sign in, create a session, open its share link in another
tab (or on your phone) to try the client flow.

## Populating real images

```bash
npm run ingest -- --source arena --keyword minimal
npm run ingest -- --source stock_unsplash --all
npm run ingest -- --source ai_generated --keyword brutalist
```

Each connector in `src/lib/sources/` upserts into the `images` table keyed
on `image_url`, so re-running is safe. **Clear the `placeholder_dev` rows
seeded by `npm run seed` before using this with a real client** — they're
dev-only filler, not real reference images:

```sql
delete from images where source_platform = 'placeholder_dev';
```

For Savee / Same.Energy / Cosmos.so / Pinterest, there is no ingestion
command — PRD §5 found all four prohibit automated collection (or, for
Savee's API, prohibit storing/republishing what it returns). The only path
for those is `/admin/import`: a human browses the site normally and enters
one image at a time, by hand, with its source credited.

## What's here vs. what's a known gap

This is a working Phase-1 build per the PRD, not a fully hardened product.
Known gaps, called out rather than silently shipped:

- **No resumability.** PRD §8 lists "if a client closes the tab mid-deck,
  they can reopen the link and resume" as a requirement; this build doesn't
  implement it (no client-side identity is persisted across reloads). A
  dropped session currently needs the admin to treat the link as spent and
  issue a new one.
- **AI-generated image URLs may be ephemeral** (`src/lib/sources/ai-generate.ts`)
  — some providers' generation URLs expire. Fine for a trial run; download
  and re-host via Supabase Storage before relying on these long-term.
- **Custom-keyword matching is lexical, not semantic** (`mapCustomKeywordToCanonical`
  in `src/lib/deck.ts`) — cheap substring matching, not an embedding
  lookup. Good enough as a v1 fallback; revisit if free-text keyword input
  turns out to be common.
- **Single-tenant only** (PRD §10 decision #4) — one admin, enforced by a
  password+cookie gate, not real multi-user auth. Phase 3 per the PRD.

## Project structure

```
src/lib/types.ts         — DB record shapes (mirrors supabase/schema.sql)
src/lib/keywords.ts       — the 50-keyword taxonomy (PRD §6.1)
src/lib/deck.ts            — keyword-match deck assembly (PRD §6.2)
src/lib/sources/           — one file per image source connector (PRD §5.1)
src/lib/summary.ts          — AI style-brief generation (PRD §7)
src/lib/auth.ts              — single-creator admin session (see gap above)
src/app/admin/…               — creator-facing pages
src/app/s/[token]/…            — client-facing register→keywords→swipe flow
scripts/ingest.ts                — CLI for the automated source connectors
scripts/seed.ts                    — dev-only keyword + placeholder-image seed
```
