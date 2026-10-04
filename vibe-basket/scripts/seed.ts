#!/usr/bin/env tsx
/**
 * Dev-only seed: writes the keyword taxonomy, plus a handful of
 * placeholder images per keyword so the swipe flow is testable end-to-end
 * without any of the real source connectors configured yet.
 *
 * The placeholder images come from picsum.photos (no API key, no terms
 * issue — it's a placeholder-image service, not a reference-image source)
 * and are tagged `source_platform: "placeholder_dev"`. Run
 * `npm run ingest -- --source <...> --all` to replace them with real
 * images before anything ships to a real client.
 *
 *   npm run seed
 */
import { config } from "dotenv";
config({ path: ".env.local" });

import { supabaseAdmin } from "../src/lib/supabase/server";
import { KEYWORD_TAXONOMY } from "../src/lib/keywords";
import { buildImage, upsertImages } from "../src/lib/sources/common";

const PLACEHOLDERS_PER_KEYWORD = 6;

async function seedKeywords() {
  const db = supabaseAdmin();
  const rows = KEYWORD_TAXONOMY.map((kw, i) => ({
    slug: kw.slug,
    label: kw.label,
    group_name: kw.group,
    sort_order: i,
    active: true,
  }));

  const { error } = await db.from("keywords").upsert(rows, { onConflict: "slug" });
  if (error) throw error;
  console.log(`Seeded ${rows.length} keywords.`);
}

async function seedPlaceholderImages() {
  const images = KEYWORD_TAXONOMY.flatMap((kw) =>
    Array.from({ length: PLACEHOLDERS_PER_KEYWORD }, (_, i) => {
      const seed = `${kw.slug}-${i}`;
      return buildImage({
        sourcePlatform: "placeholder_dev",
        imageUrl: `https://picsum.photos/seed/${seed}/800/1000`,
        thumbnailUrl: `https://picsum.photos/seed/${seed}/300/375`,
        sourceUrl: null,
        keywords: [kw.slug],
        licenseCredit: "Dev placeholder (picsum.photos) — replace before going live",
      });
    })
  );

  const { count } = await upsertImages(images);
  console.log(`Seeded ${count} placeholder image(s) across ${KEYWORD_TAXONOMY.length} keywords.`);
}

async function main() {
  await seedKeywords();
  await seedPlaceholderImages();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
