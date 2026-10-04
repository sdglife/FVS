// The 50-keyword starter taxonomy (PRD §6.1, locked as-is per decision log
// §10 item 1). `scripts/seed.ts` writes these into the `keywords` table;
// this file is the single source of truth for the list itself.

export interface KeywordSeed {
  slug: string;
  label: string;
  group: string;
}

function toSlug(label: string): string {
  return label
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function group(group: string, labels: string[]): KeywordSeed[] {
  return labels.map((label) => ({ slug: toSlug(label), label, group }));
}

export const KEYWORD_TAXONOMY: KeywordSeed[] = [
  ...group("Mood", [
    "Minimal",
    "Maximal",
    "Moody",
    "Playful",
    "Elegant",
    "Raw",
    "Nostalgic",
    "Futuristic",
    "Serene",
    "Bold",
  ]),
  ...group("Palette", [
    "Monochrome",
    "Pastel",
    "Vibrant",
    "Muted",
    "Earthy",
    "Jewel-tone",
    "Black & White",
    "Neon",
  ]),
  ...group("Texture/Material", [
    "Organic",
    "Industrial",
    "Handmade",
    "Glossy",
    "Matte",
    "Grainy",
    "Textured",
    "Natural",
  ]),
  ...group("Era/Style", [
    "Vintage",
    "Retro-futurist",
    "Brutalist",
    "Art Deco",
    "Y2K",
    "Scandinavian",
    "Mid-century",
    "Contemporary",
  ]),
  ...group("Composition", [
    "Geometric",
    "Asymmetric",
    "Layered",
    "Clean/Grid-based",
    "Negative-space-heavy",
  ]),
  ...group("Lighting", [
    "High-contrast",
    "Soft/diffused",
    "Golden-hour",
    "Studio-lit",
    "Shadow-play",
  ]),
  ...group("Tone", [
    "Luxury",
    "Approachable",
    "Experimental",
    "Editorial",
    "Corporate/Polished",
    "Tech-forward",
  ]),
];

if (process.env.NODE_ENV !== "production") {
  const slugs = KEYWORD_TAXONOMY.map((k) => k.slug);
  const dupes = slugs.filter((s, i) => slugs.indexOf(s) !== i);
  if (dupes.length > 0) {
    throw new Error(`Duplicate keyword slugs in KEYWORD_TAXONOMY: ${dupes.join(", ")}`);
  }
  if (KEYWORD_TAXONOMY.length !== 50) {
    // Not fatal — the PRD treats 50 as a starting point, not a hard
    // invariant — but worth knowing if an edit drifts the count.
    console.warn(
      `KEYWORD_TAXONOMY has ${KEYWORD_TAXONOMY.length} entries, not the PRD's starter 50.`
    );
  }
}
