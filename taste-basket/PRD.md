# Taste Basket — Product Requirements Document

**Status:** Draft v1 — for review
**Owner:** TBD
**Last updated:** 2026-10-02

## 1. Problem

Clients struggle to put their desired visual "vibe" into words. Briefs full of
buzzwords ("clean and modern", "bold but elegant") lead to revision cycles
because the creator and client don't share a mental picture. We need a tool
that lets a client *show* their taste instead of describing it, and that
turns those choices into a concrete, written style direction the creator can
act on immediately.

## 2. Goals

- Let a creator/agency send a client a single link to a mobile-friendly swipe
  experience, no app install or account setup on the creator's side required.
- Let the client self-register (name + email or phone), pick a brand name and
  category, choose a session length, and swipe through a curated image deck
  (right = like, left = pass).
- Automatically produce two deliverables for the creator per client session:
  1. The gallery of "liked" images.
  2. A written style summary (palette, mood, lighting, composition, type
     feel, etc.) synthesized from everything the client liked.
- Work well one-handed on a phone — this is the primary device.

### Non-goals (v1)

- No multi-round swiping / refinement ("show me more like this") — single pass only.
- No payment, billing, or multi-seat team accounts for the creator org.
- No native mobile app — mobile web only.
- No real-time collaboration (multiple people swiping the same session together).

## 3. Users

| Persona | Needs |
|---|---|
| **Creator / Admin** (agency, freelance designer) | Create a swipe session for a client/project, pick or scope the image pool (by category), share one link, review results, export/share the summary. |
| **Client / Swiper** | No login friction, works on their phone, quick (2–5 min), feels like a fun quiz not homework. |

## 4. Core Flows

### 4.1 Admin: create a session
1. Admin logs in (simple email/password or magic link).
2. Clicks "New Session" → enters project/client name (optional, for their own
   organization) and picks the **image category pool(s)** to swipe from
   (e.g. Branding/Logo, Interior, Fashion, Food & Beverage, Web/UI, Packaging,
   Photography/Editorial — see §6).
3. Admin gets a shareable link (and QR code, since this is handed off in
   person often) — no further setup needed. The *client* supplies brand name,
   category, and deck size when they open the link (§4.2), not the admin —
   this keeps the admin side to one click.
4. Admin can see session status (not started / in progress / completed) and,
   once completed, open the results (§4.3).

### 4.2 Client: register and swipe
1. Client opens the link on their phone.
2. Registration screen: **Name**, and **Email or Phone** (at least one of
   the two). No password.
3. Client enters **Brand name** and picks a **Brand category** from a fixed
   list (used both to scope which images they see and to flavor the final
   summary).
4. Client picks **deck size**: 10 / 25 / 40 / 50 / 75 cards.
5. Swipe UI: one image card at a time, full-bleed on mobile.
   - Swipe right (or tap ✓) = like, swipe left (or tap ✕) = pass.
   - Progress indicator (e.g. "14 / 40").
   - Undo last swipe (single-level) in case of a mis-swipe.
6. On completing the deck, client sees a short "Thanks — here's what you
   liked" recap screen (their liked images only), then they're done. They do
   **not** see the AI-written summary — that goes to the admin.

### 4.3 Admin: results
1. Admin opens a completed session and sees:
   - Client's intake info (name, contact, brand name, category, deck size,
     completion time).
   - **Liked image gallery** (grid), each image tagged with its source
     prompt/metadata.
   - **AI-generated style summary**: a short written brief covering common
     threads across the liked set — palette/color temperature, lighting,
     mood/adjectives, composition/layout tendencies, texture/material,
     typography feel (if applicable to the category) — plus 3–5 representative
     "anchor" images.
2. Admin can export/share the results (shareable read-only link and/or
   PDF export) to hand to their design team or back to the client as a
   confirmation of direction.

## 5. Image Sourcing — **Cosmos.so feasibility check**

**Finding: do not source images from cosmos.so. It is not usable for this
product, for two independent reasons:**

1. **No API, and scraping is explicitly prohibited.** Cosmos.so publishes no
   public API, issues no API keys, and disables GraphQL introspection on its
   backend. Its Terms & Conditions explicitly prohibit "using automated means
   to access, monitor, scrape, harvest, or collect data from the Website
   without prior written consent," naming robots, spiders, crawlers, and
   data-mining tools specifically. Unofficial community tools exist (e.g. an
   unofficial MCP server, an unofficial "Odyssey" API) but every one of them
   states it's hitting the private app endpoint and that the operator is
   responsible for ToS compliance — i.e., they're a liability, not a sanctioned
   integration path.
2. **Unclear image rights even if access were allowed.** Cosmos is a curation
   platform — it aggregates images other people posted/scraped from across
   the web, and its own Terms reserve copyright in "the Content" without
   warranting the underlying images are cleared for reuse. Its separate
   "Public Work" sub-product claims to surface images *believed* to be public
   domain but explicitly disclaims any warranty and puts the compliance burden
   on the user. For a commercial client-onboarding tool — where the output
   (a curated image set + style brief) gets handed to a paying client — we'd
   be redistributing other photographers'/artists' work with no license
   trail. That's a real legal exposure for the creator using this tool, not
   just a ToS technicality.

**Recommended alternatives (any of these, can mix):**

| Option | License story | Notes |
|---|---|---|
| **AI-generated images** (what the original "Taste Basket" demo used) | We own/control generation, no third-party rights issue | Matches the original concept exactly: generate the deck from prompts per category, store the generating prompt alongside each image so "why did they like this" analysis is trivial. Can regenerate/expand a category pool on demand. |
| **Licensed stock APIs** — Unsplash API, Pexels API, Adobe Stock | Clear, well-documented commercial-use licenses | Unsplash/Pexels are free for this use case with attribution per their API terms; Adobe Stock requires a license per image but is fully commercial-safe and is directly reachable from this environment's Adobe MCP tools (`asset_search` / `asset_license_and_download_stock`) if we want higher-end curated photography. |
| **Curated in-house library** | Full control | Creator/agency uploads their own portfolio or licensed reference shots per category over time; this becomes the compounding asset of the tool. |

**v1 recommendation:** hybrid of AI-generated (primary, for breadth and for
the "common prompt → common thread" analysis trick) + an initial
hand-curated/stock seed set per category for photographic realism where pure
generation looks off (e.g. food, interiors). Keep a `source` + `license` +
`prompt_or_credit` field on every image row from day one so sourcing can
evolve without a data-model change.

## 6. Content Model

**Brand categories** (fixed list, extensible): Branding/Logo, Web & Digital
Product, Packaging, Interior/Spatial, Fashion/Apparel, Food & Beverage,
Photography/Editorial, Event/Experiential. Each category maps to its own
image pool.

**Image record:**
```
id, category, image_url, thumbnail_url,
source ("ai_generated" | "stock_licensed" | "in_house"),
generation_prompt (nullable),
tags: { palette: [...], lighting, mood: [...], composition, texture, era/style },
license_credit (nullable),
active (bool)
```

**Session record:**
```
id, admin_id, share_token, categories_in_scope[], created_at, status
```

**Respondent record (one per client who opens the link):**
```
id, session_id, name, email, phone, brand_name, brand_category,
deck_size, swipes: [{image_id, direction, ts}],
completed_at
```

**Summary record** (generated once a respondent completes):
```
respondent_id, liked_image_ids[], summary_text, tag_frequency breakdown,
generated_at
```

## 7. The "summary" generation

For each completed session:
1. Pull the tag metadata (and generation prompts, if AI-sourced) for every
   liked image.
2. Feed that structured data + the brand name/category into an LLM prompt
   that asks specifically for: dominant palette, lighting tendency, mood
   adjectives, composition/layout patterns, texture/material cues, and (for
   branding/web categories) typography feel — written as a short, usable
   creative brief, not a generic paragraph.
3. Store the result verbatim against the respondent so it doesn't change on
   re-view; add a "regenerate" action for the admin if they want a reroll.

This is the direct analog of the original demo's "analyze all the yes
pictures and output what they have in common" step — the only difference is
we persist structured tags at ingestion time instead of re-deriving them from
pixels every time, which makes the summary cheaper, faster, and more
consistent.

## 8. Non-functional requirements

- **Mobile-first**: the swipe screen must work well on a mid-range phone in
  portrait orientation; target first-card-visible under ~2s on 4G.
- **No install**: pure mobile web (PWA-friendly, but not required for v1).
- **Shareable by design**: one URL per session, no login required for the
  client side.
- **Resumable**: if a client closes the tab mid-deck, they can reopen the
  same link and resume (store progress against a device/local token).
- **Accessible swipe alternative**: large tap targets (✓ / ✕ buttons) as a
  fallback to the gesture swipe, for accessibility and for admins
  demoing on desktop.

## 9. Suggested tech stack

Given this repo already uses **Vite + React** (see `flexible-visual-systems/`),
v1 can reuse that pattern for consistency:

- Frontend: React + Vite, Framer Motion (or `react-tinder-card`) for the
  swipe gesture, mobile-first CSS.
- Backend: lightweight API (Node/Express or a BaaS like Supabase) + Postgres
  for sessions/respondents/images; object storage (S3/Cloudinary) for image
  assets.
- AI: one call per image set at ingestion (if generating tags) and one call
  per completed respondent (summary generation).
- Hosting: single-click deploy (Vercel/Netlify) to match the "shareable web
  app" requirement from the brief.

This is a recommendation, not a decision — flag in §10 if you want a
different stack (e.g. Next.js full-stack instead of separate FE/BE).

## 10. Open questions for you

1. **Image sourcing**: go with AI-generated as primary (per §5), or do you
   already have a stock/licensing account (Unsplash+/Adobe Stock/etc.) you'd
   rather wire up first?
2. **Admin auth**: is this single-creator (just you) for now, or
   multi-tenant (multiple agencies/users each with their own sessions) from
   day one?
3. **Branding of the tool itself**: white-label per agency (their logo on the
   swipe screen) or your own "Taste Basket" branding for all clients?
4. **Session reuse**: should one admin session link support multiple
   respondents (e.g. 3 stakeholders at the same client swiping separately),
   or is it strictly one link = one respondent?
5. **Stack preference**: comfortable with the React/Vite + Supabase/Postgres
   recommendation in §9, or do you want Next.js / something else?

## 11. Phased plan

- **Phase 1 (MVP)**: registration → swipe → liked gallery + AI summary,
  single admin, AI-generated + seed stock images, 2–3 categories to start.
- **Phase 2**: more categories, admin dashboard polish, PDF/share export of
  the summary, resumable sessions, QR code sharing.
- **Phase 3**: multi-tenant admin accounts, white-labeling, richer tag
  taxonomy, in-house image library uploads per agency.

## 12. Success metrics

- % of shared links that reach a completed swipe session.
- Median time-to-complete per deck size.
- Creator-reported usefulness of the generated summary (quick survey/thumbs
  up-down after first few uses).
- Reduction in brief-revision rounds for projects that used the tool vs.
  those that didn't (qualitative, track anecdotally at first).
