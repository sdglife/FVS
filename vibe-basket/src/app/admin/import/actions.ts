"use server";

import { requireAdmin } from "@/lib/auth";
import { buildImage, upsertImages } from "@/lib/sources/common";
import type { SourcePlatform } from "@/lib/types";

const MANUAL_PLATFORMS: SourcePlatform[] = [
  "manual_savee",
  "manual_same_energy",
  "manual_cosmos",
  "manual_pinterest",
];

/**
 * Backs the Phase-1 manual-curation trickle (PRD §5.1 decision): a human
 * curator browses Savee/Same.Energy/Cosmos.so/Pinterest normally and
 * hand-enters one image at a time here. This form is the only path those
 * four platforms have into the index — no scraping tooling exists for them.
 */
export async function importManualImage(_prevState: string | undefined, formData: FormData) {
  await requireAdmin();

  const platform = String(formData.get("source_platform") ?? "");
  if (!MANUAL_PLATFORMS.includes(platform as SourcePlatform)) {
    return "Invalid source platform for manual import.";
  }

  const imageUrl = String(formData.get("image_url") ?? "").trim();
  const sourceUrl = String(formData.get("source_url") ?? "").trim();
  const licenseCredit = String(formData.get("license_credit") ?? "").trim();
  const keywords = formData.getAll("keywords").map(String);

  if (!imageUrl || !sourceUrl) {
    return "Image URL and source URL are both required for a manual import.";
  }
  if (keywords.length === 0) {
    return "Pick at least one keyword.";
  }

  try {
    const image = buildImage({
      sourcePlatform: platform as SourcePlatform,
      imageUrl,
      sourceUrl,
      keywords,
      licenseCredit: licenseCredit || null,
    });
    await upsertImages([image]);
  } catch (err) {
    return String(err);
  }

  return undefined;
}
