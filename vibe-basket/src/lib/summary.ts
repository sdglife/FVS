import Anthropic from "@anthropic-ai/sdk";
import { supabaseAdmin } from "@/lib/supabase/server";
import type { ImageRow, RespondentRow, SummaryRow } from "@/lib/types";

/**
 * Style-summary generation (PRD §7) — the direct analog of the original
 * "Taste Basket" demo's "analyze all the yes pictures and output what they
 * have in common" step. We persist structured keyword tags at ingestion
 * time (lib/sources/*), so this reads tags rather than re-deriving them
 * from pixels, which keeps it cheap and consistent.
 */

let client: Anthropic | null = null;
function anthropic(): Anthropic {
  if (!client) client = new Anthropic(); // reads ANTHROPIC_API_KEY
  return client;
}

export async function generateSummary(respondentId: string): Promise<SummaryRow> {
  const db = supabaseAdmin();

  const { data: respondent, error: respondentError } = await db
    .from("respondents")
    .select("*")
    .eq("id", respondentId)
    .single();
  if (respondentError) throw respondentError;

  const { data: likedSwipes, error: swipesError } = await db
    .from("swipes")
    .select("image_id")
    .eq("respondent_id", respondentId)
    .eq("direction", "like");
  if (swipesError) throw swipesError;

  const likedImageIds = (likedSwipes ?? []).map((s) => s.image_id as string);
  if (likedImageIds.length === 0) {
    throw new Error(`Respondent ${respondentId} has no liked images to summarize.`);
  }

  const { data: likedImages, error: imagesError } = await db
    .from("images")
    .select("*")
    .in("id", likedImageIds);
  if (imagesError) throw imagesError;

  const images = (likedImages ?? []) as ImageRow[];
  const tagFrequency = buildTagFrequency(images);
  const summaryText = await writeSummary(respondent as RespondentRow, images);

  const row: SummaryRow = {
    respondent_id: respondentId,
    liked_image_ids: likedImageIds,
    summary_text: summaryText,
    tag_frequency: tagFrequency,
    generated_at: new Date().toISOString(),
  };

  const { error: upsertError } = await db
    .from("summaries")
    .upsert(row, { onConflict: "respondent_id" });
  if (upsertError) throw upsertError;

  return row;
}

function buildTagFrequency(images: ImageRow[]): Record<string, number> {
  const freq: Record<string, number> = {};
  for (const image of images) {
    for (const tag of [...image.keywords, ...image.custom_tags]) {
      freq[tag] = (freq[tag] ?? 0) + 1;
    }
  }
  return freq;
}

async function writeSummary(
  respondent: RespondentRow,
  images: ImageRow[]
): Promise<string> {
  const imageDescriptions = images
    .map((img, i) => {
      const parts = [`#${i + 1}`, `tags: ${img.keywords.join(", ")}`];
      if (img.custom_tags.length > 0) parts.push(`custom tags: ${img.custom_tags.join(", ")}`);
      if (img.generation_prompt) parts.push(`generation prompt: "${img.generation_prompt}"`);
      return parts.join(" — ");
    })
    .join("\n");

  const userPrompt = `Brand name: ${respondent.brand_name}
Chosen vibe keywords: ${respondent.chosen_keywords.join(", ")}${
    respondent.custom_keyword_text ? ` (also typed: "${respondent.custom_keyword_text}")` : ""
  }

The client swiped "like" on ${images.length} reference images. Here is what
is known about each one:

${imageDescriptions}

Write a short, usable creative brief (150-250 words) describing the common
aesthetic thread across these images, specifically covering: dominant
palette/color temperature, lighting tendency, mood (as adjectives),
composition/layout patterns, texture/material cues, and typography feel (if
inferable). Write it as a brief a designer could act on immediately — not a
generic paragraph, no preamble, no restating the instructions.`;

  const response = await anthropic().messages.create({
    model: "claude-opus-5-5",
    max_tokens: 1024,
    output_config: { effort: "low" },
    system:
      "You are a brand/creative-direction assistant. You write tight, " +
      "concrete visual style briefs from a set of tagged reference images " +
      "a client selected. Be specific, never generic ('clean and modern').",
    messages: [{ role: "user", content: userPrompt }],
  });

  const textBlock = response.content.find(
    (b): b is Anthropic.TextBlock => b.type === "text"
  );
  if (!textBlock) {
    throw new Error(
      `Summary generation returned no text block (stop_reason: ${response.stop_reason}).`
    );
  }
  return textBlock.text.trim();
}
