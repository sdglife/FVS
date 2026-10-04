"use server";

import { supabaseAdmin } from "@/lib/supabase/server";
import { assembleDeck, mapCustomKeywordToCanonical } from "@/lib/deck";
import { KEYWORD_TAXONOMY } from "@/lib/keywords";
import { generateSummary } from "@/lib/summary";
import type { DeckSize, ImageRow, SessionRow, SwipeDirection } from "@/lib/types";

const CANONICAL_SLUGS = KEYWORD_TAXONOMY.map((k) => k.slug);

export interface StartRespondentInput {
  token: string;
  name: string;
  email?: string;
  phone?: string;
  brandName: string;
  chosenKeywords: string[]; // canonical slugs the client actually picked, 0-3
  customKeywordText?: string;
  deckSize: DeckSize;
}

export interface StartRespondentResult {
  respondentId: string;
  deck: ImageRow[];
}

export async function startRespondent(
  input: StartRespondentInput
): Promise<StartRespondentResult | { error: string }> {
  const db = supabaseAdmin();

  const { data: session, error: sessionError } = await db
    .from("sessions")
    .select("*")
    .eq("share_token", input.token)
    .single();
  if (sessionError || !session) return { error: "This link isn't valid." };

  const typedSession = session as SessionRow;

  // PRD §10 decision #5: one link = one respondent.
  const { data: existing } = await db
    .from("respondents")
    .select("id")
    .eq("session_id", typedSession.id)
    .maybeSingle();
  if (existing) {
    return { error: "This link has already been used to complete a session." };
  }

  if (!input.name.trim()) return { error: "Name is required." };
  if (!input.email && !input.phone) return { error: "Email or phone is required." };
  if (!input.brandName.trim()) return { error: "Brand name is required." };

  const customMatches = input.customKeywordText
    ? mapCustomKeywordToCanonical(input.customKeywordText, CANONICAL_SLUGS)
    : [];
  const deckKeywords = [...new Set([...input.chosenKeywords, ...customMatches])];
  if (deckKeywords.length === 0) {
    return { error: "Pick at least one keyword (or type your own)." };
  }

  const { data: respondent, error: insertError } = await db
    .from("respondents")
    .insert({
      session_id: typedSession.id,
      name: input.name.trim(),
      email: input.email || null,
      phone: input.phone || null,
      brand_name: input.brandName.trim(),
      chosen_keywords: input.chosenKeywords,
      custom_keyword_text: input.customKeywordText || null,
      deck_size: input.deckSize,
    })
    .select("id")
    .single();
  if (insertError || !respondent) {
    return { error: insertError?.message ?? "Could not start session." };
  }

  await db.from("sessions").update({ status: "in_progress" }).eq("id", typedSession.id);

  const deck = await assembleDeck({ keywords: deckKeywords, deckSize: input.deckSize });

  return { respondentId: respondent.id as string, deck };
}

export async function recordSwipe(
  respondentId: string,
  imageId: string,
  direction: SwipeDirection
): Promise<void> {
  const db = supabaseAdmin();
  const { error } = await db
    .from("swipes")
    .upsert(
      { respondent_id: respondentId, image_id: imageId, direction },
      { onConflict: "respondent_id,image_id" }
    );
  if (error) throw error;
}

export async function completeRespondent(respondentId: string): Promise<void> {
  const db = supabaseAdmin();

  const { data: respondent, error } = await db
    .from("respondents")
    .update({ completed_at: new Date().toISOString() })
    .eq("id", respondentId)
    .select("session_id")
    .single();
  if (error || !respondent) throw error ?? new Error("Respondent not found");

  await db
    .from("sessions")
    .update({ status: "completed" })
    .eq("id", respondent.session_id as string);

  try {
    await generateSummary(respondentId);
  } catch (err) {
    // Don't block the client's "thanks" screen on summary generation —
    // the admin can retry from the results page (RegenerateButton).
    console.error(`Summary generation failed for respondent ${respondentId}:`, err);
  }
}
