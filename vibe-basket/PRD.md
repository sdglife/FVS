# NVRFOUND Vibe Basket — Product Requirements Document

**Status:** Draft v5 — decisions locked, in active build
**Owner:** TBD
**Last updated:** 2026-10-04
**Changelog:**
- v2 added the multi-platform sourcing feasibility check (Are.na, Savee,
  Same.Energy, Cosmos.so) and switched deck-scoping from category-only to a
  **3-keyword selection** model.
- v3 names the product **NVRFOUND Vibe Basket** and confirms scope: the
  automated image backbone is Are.na + licensed stock + AI-generated only.
  Cosmos.so and Pinterest were both evaluated as scrape targets and ruled
  out — see §5.
- v4 locks the remaining open questions from v3's §10: single-creator admin
  for v1, one link = one respondent, Next.js full-stack, and the
  Savee/Same.Energy/Cosmos manual-curation trickle is in scope starting
  Phase 1 rather than deferred. See §9–§11.
- v5 corrects the Are.na integration after reading their full Acceptable
  Use terms (provided alongside a real access token): Are.na explicitly
  prohibits "automated crawling, systematic downloading of content, or any
  form of structured data harvesting" through its API — which is what
  v4's batch-ingestion design for Are.na actually was, despite using a
  sanctioned API with a valid token. Having an API does not exempt bulk
  collection through it. Are.na is now queried live, per respondent,
  scoped to that one person's chosen keywords, never pre-harvested into a
  standing library. See §5/§5.1.

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
- Let the client self-register (name + email or phone), name their brand,
  pick **3 keywords** that describe the vibe they're after (from a curated
  list of 50, or their own), choose a session length, and swipe through a
  keyword-matched image deck (right = like, left = pass).
- Automatically produce two deliverables for the creator per client session:
  1. The gallery of "liked" images.
  2. A written style summary (palette, mood, lighting, composition, type
     feel, etc.) synthesized from everything the client liked.
- Source the image library itself in a way that's actually legal to operate
  — see §5, since this product pulls visual reference material from
  third-party moodboard sites and that's where most of the real risk lives.
- Work well one-handed on a phone — this is the primary device.

### Non-goals (v1)

- No multi-round swiping / refinement ("show me more like this") — single pass only.
- No payment, billing, or multi-seat team accounts for the creator org.
- No native mobile app — mobile web only.
- No real-time collaboration (multiple people swiping the same session together).
- No redistribution of third-party images as a *commercial deliverable* —
  everything sourced from Are.na/Savee/Same.Energy stays a private,
  internal reference moodboard for the creator and their client, never
  resold, never published, never used as final licensed creative assets
  (see §5 for why this distinction matters and what it does/doesn't fix).

## 3. Users

| Persona | Needs |
|---|---|
| **Creator / Admin** (agency, freelance designer) | Create a swipe session for a client/project, share one link, review results, export/share the summary. |
| **Client / Swiper** | No login friction, works on their phone, quick (2–5 min), feels like a fun quiz not homework. |

## 4. Core Flows

### 4.1 Admin: create a session
1. Admin logs in (simple email/password or magic link). v1 is
   **single-creator**: one admin account, no org/team model or per-tenant
   data isolation (multi-tenant support is pushed to Phase 3 — see §11).
2. Clicks "New Session" → enters project/client name (optional, for their
   own organization). No category/keyword setup needed here — the client
   picks their own keywords when they open the link (§4.2); this keeps the
   admin side to one click.
3. Admin gets a shareable link (and QR code, since this is handed off in
   person often). **One link = one respondent**: if a client has multiple
   stakeholders who each need to swipe independently, the admin generates a
   separate link per person (one click each) rather than sharing one link
   around.
4. Admin can see session status (not started / in progress / completed) and,
   once completed, open the results (§4.3).

### 4.2 Client: register and swipe
1. Client opens the link on their phone.
2. Registration screen: **Name**, and **Email or Phone** (at least one of
   the two). No password.
3. Client enters **Brand name**.
4. **Keyword picker**: client is shown a grid/list of **50 curated vibe
   keywords** (see §6.1 for the starter list) and must choose **exactly 3**.
   They may instead (or additionally, up to the 3-keyword cap) type their
   own free-text keyword if none of the 50 fit — see §6.2 for how custom
   keywords get matched to images.
5. Client picks **deck size**: 10 / 25 / 40 / 50 / 75 cards.
6. System assembles a deck: images from the reference index whose tags best
   match the chosen 3 keywords (§6.2 covers the matching/ranking logic),
   sized to the chosen deck size.
7. Swipe UI: one image card at a time, full-bleed on mobile.
   - Swipe right (or tap ✓) = like, swipe left (or tap ✕) = pass.
   - Progress indicator (e.g. "14 / 40").
   - Undo last swipe (single-level) in case of a mis-swipe.
8. On completing the deck, client sees a short "Thanks — here's what you
   liked" recap screen (their liked images only), then they're done. They do
   **not** see the AI-written summary — that goes to the admin.

### 4.3 Admin: results
1. Admin opens a completed session and sees:
   - Client's intake info (name, contact, brand name, chosen keywords, deck
     size, completion time).
   - **Liked image gallery** (grid), each image tagged with its source
     platform, source link/credit, and matched keywords.
   - **AI-generated style summary**: a short written brief covering common
     threads across the liked set — palette/color temperature, lighting,
     mood/adjectives, composition/layout tendencies, texture/material,
     typography feel — plus 3–5 representative "anchor" images.
2. Admin can export/share the results (shareable read-only link and/or
   PDF export) to hand to their design team or back to the client as a
   confirmation of direction. Because some images in the set may be
   third-party reference material (see §5), this export is explicitly
   labeled "internal reference moodboard" with source credits intact — not
   presented as cleared, licensed creative.

## 5. Image Sourcing — multi-platform feasibility check

You asked to pull reference images from **Are.na, Savee, Same.Energy, and
Cosmos.so**. I checked all four for an API and for what their terms actually
allow. Headline: **none of them can be bulk-scraped for this**, even for a
non-commercial, reference-only use — but one of them (Are.na) has a real,
sanctioned API we can build on, and the other three need a different
approach. "No commercial gain" and "reference only" reduce legal severity
but don't waive a platform's Terms of Service or the copyright of the
individual photographers/designers whose work is on these sites — scraping
prohibitions and "you may not copy or store this" clauses apply regardless
of what we intend to do with the images afterward.

| Platform | API? | What their terms actually allow | Verdict |
|---|---|---|---|
| **Are.na** | **Yes** — public, documented REST API (`api.are.na`, v3), personal access tokens, explicitly built for third-party tools. **But** its Acceptable Use terms separately state: "This API is intended for building applications that integrate with Are.na, not for scraping or bulk data collection. Automated crawling, systematic downloading of content, or any form of structured data harvesting is prohibited." | Having an API and a valid token does not waive that clause. The compliant pattern is a **live query scoped to one real respondent's session**, not a background job that loops every keyword to pre-build our own library. Images stay **hotlinked + attributed + linked back to the source block/user**, never silently re-hosted. | **Usable, live-only** — no batch ingestion script exists for this source (see §5.1); queried on demand per respondent inside deck assembly. |
| **Savee** | Has an official REST API *and* an MCP server. | Section 5 of Savee's ToS says explicitly: being able to see/search/fetch something via the app, API, or an AI assistant **gives you no right to copy, store, publish, or otherwise use it** — because Savee doesn't own the images either; they're saved from around the web by members. | **Do not ingest/store.** The API exists for querying *your own* Savee account's saves, not for building a third-party content index. Only viable path: manual, human-reviewed curation (§5.1), not automated. |
| **Same.Energy** | **No public API.** Their own About page says selling API access is only "being considered." | No stated terms for bulk access because there's no access to grant. Scraping an unauthenticated, no-API visual search engine is squarely the kind of unauthorized automated collection most ToS (and site-protection measures) exist to stop. | **Not usable via automation.** Manual curation only, or wait/ask them directly about future API access. |
| **Cosmos.so** | **No public API**, GraphQL introspection disabled. | ToS explicitly bans "using automated means to access, monitor, scrape, harvest, or collect data... including robots, spiders, crawlers, scrapers, or data-mining tools." Unofficial community wrappers exist but each one says the operator owns the ToS risk. | **Not usable**, same finding as the v1 PRD. |
| **Pinterest** | Has an official Developer API, but it's scoped to login/content-publishing/ads integrations for approved apps, not bulk read access to other users' pins. | Pinterest's Terms of Service prohibit scraping/automated data collection from the site itself, separately from the API program. | **Not usable** for bulk ingestion. Same category as Cosmos.so. |

**Cosmos.so and Pinterest were both specifically evaluated as scrape targets
during this project and ruled out.** Both explicitly prohibit automated
collection in their Terms of Service, and in both cases the underlying
images are third parties' copyrighted work with no license trail, which
doesn't change based on commercial intent or a "reference only" framing. No
scraper, proxy, or unofficial wrapper (e.g. the community "Odyssey" client
for Cosmos) was built against either platform, and none is planned. If
volume from either becomes important later, the only path considered viable
is asking the platform directly for API/data-partnership access (§5.1).

### 5.1 What we'll actually do

**Are.na — live per-respondent query, never batch-ingested:**
When a respondent's deck is short on real matches for their chosen
keywords, we call Are.na's search endpoint live, scoped to that one
person's 1-3 keywords, bounded to roughly the shortfall in their deck —
then store just those results (hotlinked, attributed, linked back to the
source) so they have a stable row for that respondent's swipes to
reference. There is no scheduled or on-demand job that loops the full
50-keyword list against Are.na — that would be the "systematic
downloading" / "structured data harvesting" their terms rule out. If this
undershoots real volume, the honest next step is asking Are.na directly
about bulk access, per their own "contact us" line — not a bigger batch job.

**Automated, scalable, batch-ingestible sources (`npm run ingest`):**
1. **Licensed stock APIs** (Unsplash, Pexels, Adobe Stock via this
   environment's Adobe MCP tools) tagged into the keyword taxonomy — zero
   rights ambiguity, and their terms are the ordinary "cache/store what you
   fetch within your app" kind, not Are.na's bulk-collection carve-out.
2. **AI-generated images** — same as the v1 plan, generated per keyword
   combination; we fully own these and can mint more on demand for whatever
   keyword pairs are thin on real images.

**Manual-only, low-volume sources (Savee, Same.Energy, Cosmos.so, Pinterest):**
A human curator browses these sites the normal way (as any visitor would),
hand-picks individual images worth referencing, and manually tags +
imports them one at a time into our index with source credit preserved.
This keeps a human editorial decision in the loop instead of automated bulk
collection, which is the actual distinction their terms care about — but it
is slow by design and won't scale to "50 keywords × many images each."

**This manual trickle is in scope starting Phase 1** (per your call in
§10/§11, not deferred to Phase 2): a curator works through it in parallel
with the build, seeding a modest batch of real-world references across the
highest-priority keywords while the automated sources (above) carry the
bulk of the volume from day one. It stays a trickle, not a pipeline — no
scraping tooling gets built for these four; it's manual labor with a simple
internal import form (brand name/category/keywords/source link/credit) that
feeds the same `Image record` shape as every other source. If real volume
from these specifically matters later, the clean way to get it is to ask
each platform directly for a data-partnership/API arrangement — Same.Energy's
own site already invites exactly that conversation.

**What we will not do:** write an automated scraper, or use an unofficial
wrapper/proxy (e.g. the community "Odyssey" client for Cosmos), against
Savee, Same.Energy, Cosmos.so, or Pinterest. That's true regardless of
commercial intent, and it's also just a fragile foundation — any of these
can rate-limit, IP-ban, or structurally change overnight with no recourse
since we'd have no sanctioned access to fall back on.

## 6. Content Model

### 6.1 The 50 keywords (starter list, editable)

Grouped for reference; the client just sees a flat searchable grid of 50 and
picks 3.

- **Mood (10):** Minimal, Maximal, Moody, Playful, Elegant, Raw, Nostalgic,
  Futuristic, Serene, Bold
- **Palette (8):** Monochrome, Pastel, Vibrant, Muted, Earthy, Jewel-tone,
  Black & White, Neon
- **Texture/Material (8):** Organic, Industrial, Handmade, Glossy, Matte,
  Grainy, Textured, Natural
- **Era/Style (8):** Vintage, Retro-futurist, Brutalist, Art Deco, Y2K,
  Scandinavian, Mid-century, Contemporary
- **Composition (5):** Geometric, Asymmetric, Layered, Clean/Grid-based,
  Negative-space-heavy
- **Lighting (5):** High-contrast, Soft/diffused, Golden-hour, Studio-lit,
  Shadow-play
- **Tone (6):** Luxury, Approachable, Experimental, Editorial,
  Corporate/Polished, Tech-forward

(50 exactly — the original draft of this list actually listed 55; trimmed
Whimsical, Romantic, Collage, Street/Underground, and Sustainable/Natural
as the most overlapping-with-others entries to get to a true 50, to match
`src/lib/keywords.ts`, the actual source of truth. Easy to tune further
after the first few client sessions show what gets picked vs. ignored.)

### 6.2 Keyword → image matching

- Every image in the index carries a `keywords[]` field: 2–6 tags drawn from
  the canonical 50, assigned at ingestion time (by the AI tagging pass for
  generated/stock images, by the human curator for manually-imported ones,
  and by the matched keyword slug itself for a live Are.na result, which
  is stored only when it's actually used to fill a respondent's deck —
  see §5.1).
- When a client picks 3 keywords, the deck is assembled by scoring each
  candidate image on keyword overlap (3/3 matches ranked highest, then 2/3,
  then 1/3) and sampling across sources so one platform doesn't dominate the
  deck. If a keyword combination is thin, the AI-generation source (§5.1)
  tops up the pool on demand.
- **Custom keywords**: if a client types their own term instead of picking
  from the 50, we embed it and map it to the nearest canonical keyword(s)
  for retrieval purposes, *and* store the literal custom term against the
  session so the admin sees what the client actually typed (useful signal
  even if matching fell back to a close canonical tag).

### 6.3 Records

**Image record:**
```
id, keywords: [...3-6 of the 50 canonical tags...], custom_tags: [...],
image_url, thumbnail_url,
source_platform ("arena" | "stock_unsplash" | "stock_pexels" |
                  "stock_adobe" | "ai_generated" | "manual_savee" |
                  "manual_same_energy" | "in_house"),
source_url (link back to original, required for arena/manual_*),
usage_mode ("hotlinked" | "stored_copy"),
generation_prompt (nullable, for ai_generated),
license_credit (nullable),
active (bool)
```

**Session record:**
```
id, admin_id, share_token, created_at, status
```

**Respondent record (one per client who opens the link):**
```
id, session_id, name, email, phone, brand_name,
chosen_keywords: [k1, k2, k3], custom_keyword_text (nullable),
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
2. Feed that structured data + the brand name + the 3 chosen keywords into
   an LLM prompt that asks specifically for: dominant palette, lighting
   tendency, mood adjectives, composition/layout patterns, texture/material
   cues, and typography feel — written as a short, usable creative brief,
   not a generic paragraph.
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
- **Attribution rendering**: any card sourced from Are.na or manually from
  Savee/Same.Energy must show a small source credit/link, both during
  swiping and in the admin's final gallery export.

## 9. Tech stack — **locked**

**Next.js full-stack**, chosen over the repo's existing Vite+React pattern
(`flexible-visual-systems/`) for a single framework covering frontend, API
routes, and server logic:

- **Framework**: Next.js (App Router), React for the swipe UI, Framer Motion
  (or `react-tinder-card`) for the swipe gesture, mobile-first CSS.
- **Data**: Supabase — Postgres for sessions/respondents/images, built-in
  Auth for the single admin account, and Storage for images we're entitled
  to store a copy of (AI-generated, licensed stock, manually-curated-with-
  credit). Are.na-sourced images stay hotlinked, not copied, per §5.
- **API**: Next.js route handlers / server actions for session creation,
  deck assembly (keyword matching, §6.2), swipe recording, and summary
  generation — no separate backend service.
- **AI**: one call per image batch at ingestion (tagging) and one call per
  completed respondent (summary generation); embeddings for custom-keyword
  matching (§6.2).
- **Hosting**: Vercel — native fit for Next.js, one-click deploy, matches
  the "shareable web app" requirement from the brief.

This is now a decision, not a recommendation — it lives in its own
`vibe-basket/` project folder independent of `flexible-visual-systems/`'s
Vite setup.

## 10. Decisions log

All of v3's open questions are resolved. Keeping this as a log rather than
deleting it so the "why" stays attached to the PRD.

| # | Topic | Decision |
|---|---|---|
| 1 | Keyword list (§6.1) | Ship the 50-keyword starter list as-is; tune individual terms after real sessions show what gets picked vs. ignored. |
| 2 | Savee/Same.Energy/Cosmos/Pinterest volume (§5.1) | Manual-curation trickle **is in scope for Phase 1**, run in parallel with the build — not deferred, but still never automated. |
| 3 | Attribution UI (§8) | Small, unobtrusive source-credit chip (e.g. "via Are.na") on sourced cards, visible during swiping and in the admin export. |
| 4 | Admin auth (§4.1) | Single-creator for v1. No org/team model; multi-tenant deferred to Phase 3. |
| 5 | Session reuse (§4.1) | One link = one respondent. Multiple stakeholders → admin issues multiple links. |
| 6 | Stack (§9) | Next.js full-stack + Supabase + Vercel, locked. |

Nothing is currently open. If anything in this log stops fitting once we're
building (e.g. the keyword list needs reshaping, or single-respondent links
turn out to be annoying in practice), raise it and we'll amend this log
rather than silently drifting from it.

## 11. Phased plan

- **Phase 1 (MVP)**: registration → keyword picker → swipe → liked gallery +
  AI summary. Automated image pool from Are.na API + licensed stock +
  AI-generated, **plus** the manual-curation trickle from Savee/Same.Energy/
  Cosmos.so/Pinterest running in parallel (§5.1). 50-keyword list locked.
  Single admin, one-link-one-respondent. Next.js + Supabase + Vercel.
- **Phase 2**: admin dashboard polish, PDF/share export of the summary,
  resumable sessions, QR code sharing, lightweight internal tooling for the
  manual-curation import form (still not automated scraping — just making
  the human curator's job faster).
- **Phase 3**: multi-tenant admin accounts, white-labeling, richer tag
  taxonomy, in-house image library uploads per agency, direct API/data
  partnership outreach to Same.Energy/Savee/Pinterest if volume from them
  becomes important.

## 12. Success metrics

- % of shared links that reach a completed swipe session.
- Median time-to-complete per deck size.
- Keyword coverage: % of the 50 keywords (and combos) with a healthy image
  pool vs. ones that fall back to AI-generation every time (signals where
  to grow the curated/stock pool).
- Creator-reported usefulness of the generated summary (quick survey/thumbs
  up-down after first few uses).
- Reduction in brief-revision rounds for projects that used the tool vs.
  those that didn't (qualitative, track anecdotally at first).
