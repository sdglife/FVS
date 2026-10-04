import { supabaseAdmin } from "@/lib/supabase/server";
import type { ImageRow, SourcePlatform, UsageMode } from "@/lib/types";
import { HOTLINK_ONLY_PLATFORMS } from "@/lib/types";

export type NewImage = Omit<ImageRow, "id" | "created_at">;

export interface SourceConnector {
  /** Matches SourcePlatform; identifies rows this connector owns. */
  platform: SourcePlatform;
  /**
   * Fetch images for one canonical keyword slug. Connectors own their own
   * pagination/rate-limit handling; this just returns one batch.
   */
  fetchForKeyword(keywordSlug: string, keywordLabel: string): Promise<NewImage[]>;
}

export function buildImage(args: {
  sourcePlatform: SourcePlatform;
  imageUrl: string;
  thumbnailUrl?: string | null;
  sourceUrl: string | null;
  keywords: string[];
  customTags?: string[];
  generationPrompt?: string | null;
  licenseCredit?: string | null;
}): NewImage {
  const usageMode: UsageMode = HOTLINK_ONLY_PLATFORMS.has(args.sourcePlatform)
    ? "hotlinked"
    : "stored_copy";

  if (usageMode === "hotlinked" && !args.sourceUrl) {
    throw new Error(
      `${args.sourcePlatform} images must carry a source_url (PRD §5: hotlink + attribute).`
    );
  }

  return {
    image_url: args.imageUrl,
    thumbnail_url: args.thumbnailUrl ?? null,
    source_platform: args.sourcePlatform,
    source_url: args.sourceUrl,
    usage_mode: usageMode,
    keywords: args.keywords,
    custom_tags: args.customTags ?? [],
    generation_prompt: args.generationPrompt ?? null,
    license_credit: args.licenseCredit ?? null,
    active: true,
  };
}

/** Idempotent upsert keyed on image_url (unique in supabase/schema.sql). */
export async function upsertImages(images: NewImage[]): Promise<{ count: number }> {
  if (images.length === 0) return { count: 0 };

  const db = supabaseAdmin();
  const { error, count } = await db
    .from("images")
    .upsert(images, { onConflict: "image_url", count: "exact" });

  if (error) throw error;
  return { count: count ?? images.length };
}
