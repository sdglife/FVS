import { supabaseAdmin } from "@/lib/supabase/server";
import { KEYWORD_TAXONOMY } from "@/lib/keywords";
import { searchArenaImages } from "@/lib/sources/arena";
import type { DeckSize, ImageRow } from "@/lib/types";

const SLUG_TO_LABEL = new Map(KEYWORD_TAXONOMY.map((k) => [k.slug, k.label]));

/**
 * Deck assembly (PRD §6.2): score every active image by overlap with the
 * respondent's 3 chosen keywords, rank 3/3 > 2/3 > 1/3, then sample across
 * source platforms so one source doesn't dominate the deck.
 */

const MAX_CANDIDATE_POOL = 1000;

export interface AssembleDeckInput {
  keywords: string[]; // canonical slugs, 1-3 of them (custom-mapped upstream)
  deckSize: DeckSize;
}

export async function assembleDeck({
  keywords,
  deckSize,
}: AssembleDeckInput): Promise<ImageRow[]> {
  if (keywords.length === 0) {
    throw new Error("assembleDeck requires at least one keyword");
  }

  const db = supabaseAdmin();
  const { data, error } = await db
    .from("images")
    .select("*")
    .eq("active", true)
    .overlaps("keywords", keywords)
    .limit(MAX_CANDIDATE_POOL);

  if (error) throw error;

  const candidates = (data ?? []) as ImageRow[];
  const scored = candidates
    .map((image) => ({
      image,
      score: overlapScore(image.keywords, keywords),
    }))
    .filter((c) => c.score > 0)
    .sort((a, b) => b.score - a.score);

  let deck = sampleAcrossSources(scored, deckSize);

  if (deck.length < deckSize) {
    deck = await topUpFromArena(deck, keywords, deckSize);
  }

  if (deck.length < deckSize) {
    // PRD §5.1/§6.2: when a keyword combo is still thin after the Are.na
    // top-up, the AI-generation source is meant to fill the rest. That
    // generation call is a separate, slower, costed operation
    // (lib/sources/ai-generate.ts) — deliberately not invoked synchronously
    // here, which needs to stay fast for the swipe UI. Ship what real
    // matches exist; surface the shortfall so an admin/curator knows to
    // backfill.
    console.warn(
      `Deck for keywords [${keywords.join(", ")}] only has ${deck.length}/${deckSize} ` +
        "matching images. Consider running the AI-generation or stock " +
        "connectors for this combination (see lib/sources/)."
    );
  }

  return deck;
}

/**
 * Live, per-request Are.na top-up (see lib/sources/arena.ts for why this
 * is NOT a batch ingestion path: Are.na's Acceptable Use clause prohibits
 * bulk/systematic harvesting, so this only ever fetches the small, bounded
 * number of images needed to fill *this one respondent's* deck, right now
 * — never a background crawl across keywords). Results are written to the
 * `images` table because `swipes.image_id` has a foreign key to it, not as
 * a standing cache — each call fetches only what this deck is short by.
 */
async function topUpFromArena(
  deck: ImageRow[],
  keywords: string[],
  deckSize: DeckSize
): Promise<ImageRow[]> {
  if (!process.env.ARENA_ACCESS_TOKEN) return deck;

  const shortfall = deckSize - deck.length;
  const perKeyword = Math.ceil(shortfall / keywords.length);
  const seenUrls = new Set(deck.map((img) => img.image_url));
  const fresh: Omit<ImageRow, "id" | "created_at">[] = [];

  for (const slug of keywords) {
    if (fresh.length >= shortfall) break;
    const label = SLUG_TO_LABEL.get(slug) ?? slug;
    try {
      const results = await searchArenaImages(label, perKeyword);
      for (const r of results) {
        if (fresh.length >= shortfall) break;
        if (seenUrls.has(r.image_url)) continue;
        seenUrls.add(r.image_url);
        fresh.push({ ...r, keywords: [slug] });
      }
    } catch (err) {
      console.warn(`Are.na top-up failed for keyword "${slug}": ${String(err)}`);
    }
  }

  if (fresh.length === 0) return deck;

  const db = supabaseAdmin();
  const { error } = await db.from("images").upsert(fresh, { onConflict: "image_url" });
  if (error) {
    console.warn(`Failed to persist Are.na top-up images: ${error.message}`);
    return deck;
  }

  const { data: inserted } = await db
    .from("images")
    .select("*")
    .in("image_url", fresh.map((f) => f.image_url));

  return [...deck, ...((inserted ?? []) as ImageRow[])];
}

function overlapScore(imageKeywords: string[], chosen: string[]): number {
  const set = new Set(imageKeywords);
  return chosen.reduce((n, k) => n + (set.has(k) ? 1 : 0), 0);
}

/**
 * Round-robins through source platforms within each score tier so a deck
 * isn't accidentally all-Are.na or all-AI-generated just because one
 * source happens to have more thin-tag coverage.
 */
function sampleAcrossSources(
  scored: { image: ImageRow; score: number }[],
  deckSize: DeckSize
): ImageRow[] {
  const bySource = new Map<string, ImageRow[]>();
  for (const { image } of scored) {
    const bucket = bySource.get(image.source_platform) ?? [];
    bucket.push(image);
    bySource.set(image.source_platform, bucket);
  }

  const sources = [...bySource.keys()];
  const picked: ImageRow[] = [];
  const seen = new Set<string>();

  let exhausted = false;
  while (picked.length < deckSize && !exhausted) {
    exhausted = true;
    for (const source of sources) {
      if (picked.length >= deckSize) break;
      const bucket = bySource.get(source)!;
      const next = bucket.shift();
      if (next && !seen.has(next.id)) {
        picked.push(next);
        seen.add(next.id);
        exhausted = false;
      }
    }
  }

  return picked;
}

/**
 * Custom-keyword matching (PRD §6.2): map a client's free-text term to the
 * nearest canonical keyword slug(s) using simple lexical overlap against
 * keyword labels/groups. This is intentionally cheap and local — no
 * embedding API call — good enough as a v1 fallback. Swap for a real
 * embedding similarity lookup (e.g. against `keywords.label`) if free-text
 * input turns out to be common and this undershoots.
 */
export function mapCustomKeywordToCanonical(
  customTerm: string,
  canonicalSlugs: string[]
): string[] {
  const term = customTerm.trim().toLowerCase();
  if (!term) return [];

  const matches = canonicalSlugs.filter(
    (slug) => slug.includes(term) || term.includes(slug)
  );
  return matches;
}
