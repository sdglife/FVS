import type { ImageRow } from "@/lib/types";

/**
 * Are.na connector (PRD §5) — REWORKED from the original batch-ingest
 * design after reading Are.na's own Acceptable Use clause in full:
 *
 *   "This API is intended for building applications that integrate with
 *   Are.na, not for scraping or bulk data collection. Automated crawling,
 *   systematic downloading of content, or any form of structured data
 *   harvesting is prohibited. If you need bulk access ... contact us."
 *
 * The earlier version of this file looped every keyword, pulled several
 * channels' worth of blocks per keyword, and upserted them into our
 * permanent `images` table — i.e. exactly the "systematic downloading" /
 * "structured data harvesting" that clause rules out, regardless of
 * having a valid token. Having a sanctioned API does not exempt bulk
 * collection through it.
 *
 * This version instead queries Are.na LIVE, once per real swipe session,
 * scoped to that one respondent's chosen keywords, for one bounded page —
 * "building an application that integrates with Are.na," which the same
 * clause explicitly welcomes. Results are hotlinked straight into that
 * respondent's deck (lib/deck.ts) and are NOT persisted into the `images`
 * table — there is deliberately no ingestion script for this source.
 *
 * API version: Are.na's own docs (dev.are.na) confirm the base URL is
 * https://api.are.na and the current version is v3 (the token endpoint is
 * api.are.na/v3/oauth/token). The exact per-field response shape below
 * (search result item fields, channel `contents` block shape) is pieced
 * together from partial public references, NOT a verified live response —
 * this sandbox's network policy currently blocks api.are.na outright, so
 * it hasn't been exercised against the real API yet. Treat the parsing
 * below as a reasonable first pass to fix up against a real response the
 * first time this runs with network access.
 */

const ARENA_BASE = "https://api.are.na/v3";
const DEFAULT_LIMIT = 24;

interface ArenaBlockLike {
  id: number | string;
  class?: string;
  title?: string | null;
  image?: {
    original?: { url?: string };
    display?: { url?: string };
    thumb?: { url?: string };
  };
  user?: { slug?: string; username?: string };
  channel?: { slug?: string };
  connected_at?: string;
}

interface ArenaSearchResponse {
  data?: ArenaBlockLike[];
  blocks?: ArenaBlockLike[]; // fallback key name, unconfirmed
  meta?: { has_more_pages?: boolean };
}

function authHeaders(): HeadersInit {
  const token = process.env.ARENA_ACCESS_TOKEN;
  if (!token) {
    throw new Error("ARENA_ACCESS_TOKEN is not set (see .env.example).");
  }
  return { Authorization: `Bearer ${token}` };
}

/**
 * Live search for one request's worth of image blocks matching a keyword.
 * Called directly from lib/deck.ts at deck-assembly time — never from a
 * batch/ingestion script. `limit` should be bounded to roughly what one
 * respondent's deck needs for this keyword, not a large harvesting page.
 */
export async function searchArenaImages(
  keywordLabel: string,
  limit: number = DEFAULT_LIMIT
): Promise<Omit<ImageRow, "id" | "created_at">[]> {
  const res = await fetch(
    `${ARENA_BASE}/search?query=${encodeURIComponent(keywordLabel)}&type=Image&per=${Math.min(
      limit,
      DEFAULT_LIMIT
    )}`,
    { headers: authHeaders() }
  );

  if (res.status === 402 || res.status === 403) {
    // The /v3/search endpoint is reported Premium-only on some Are.na
    // tiers; a free/guest token may be rejected here. Fail loudly rather
    // than silently returning nothing, so this doesn't look like "no
    // matches" when it's actually "not entitled to search."
    throw new Error(
      `Are.na search returned ${res.status} — this token's tier may not include ` +
        "/v3/search access. Falling back is not implemented; see arena.ts."
    );
  }
  if (!res.ok) {
    throw new Error(`Are.na search failed: ${res.status} ${res.statusText}`);
  }

  const payload: ArenaSearchResponse = await res.json();
  const blocks = payload.data ?? payload.blocks ?? [];

  return blocks
    .filter((b) => b.class === "Image" && b.image?.original?.url)
    .map((b) => {
      const sourceUrl = b.channel?.slug
        ? `https://www.are.na/${b.user?.slug ?? b.user?.username ?? "channel"}/${b.channel.slug}`
        : `https://www.are.na/block/${b.id}`;

      return {
        keywords: [], // caller (lib/deck.ts) attaches the matched keyword slug
        custom_tags: [],
        image_url: b.image!.original!.url!,
        thumbnail_url: b.image?.display?.url ?? b.image?.thumb?.url ?? null,
        source_platform: "arena" as const,
        source_url: sourceUrl,
        usage_mode: "hotlinked" as const,
        generation_prompt: null,
        license_credit: `via Are.na${b.user?.username ? ` · ${b.user.username}` : ""}`,
        active: true,
      };
    });
}
