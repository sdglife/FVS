// Mirrors supabase/schema.sql (PRD §6.3). Kept hand-written rather than
// generated since the schema is small and stable; regenerate with the
// Supabase CLI (`supabase gen types typescript`) if it grows.

export type SourcePlatform =
  | "arena"
  | "stock_unsplash"
  | "stock_pexels"
  | "stock_adobe"
  | "ai_generated"
  | "manual_savee"
  | "manual_same_energy"
  | "manual_cosmos"
  | "manual_pinterest"
  | "in_house"
  | "placeholder_dev";

export type UsageMode = "hotlinked" | "stored_copy";
export type SwipeDirection = "like" | "pass";
export type SessionStatus = "not_started" | "in_progress" | "completed";
export type DeckSize = 10 | 25 | 40 | 50 | 75;
export const DECK_SIZES: DeckSize[] = [10, 25, 40, 50, 75];

export interface KeywordRow {
  id: string;
  slug: string;
  label: string;
  group_name: string;
  sort_order: number;
  active: boolean;
}

export interface ImageRow {
  id: string;
  keywords: string[];
  custom_tags: string[];
  image_url: string;
  thumbnail_url: string | null;
  source_platform: SourcePlatform;
  source_url: string | null;
  usage_mode: UsageMode;
  generation_prompt: string | null;
  license_credit: string | null;
  active: boolean;
  created_at: string;
}

export interface SessionRow {
  id: string;
  admin_id: string | null;
  project_name: string | null;
  share_token: string;
  status: SessionStatus;
  created_at: string;
}

export interface RespondentRow {
  id: string;
  session_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  brand_name: string;
  chosen_keywords: string[];
  custom_keyword_text: string | null;
  deck_size: DeckSize;
  completed_at: string | null;
  created_at: string;
}

export interface SwipeRow {
  id: string;
  respondent_id: string;
  image_id: string;
  direction: SwipeDirection;
  created_at: string;
}

export interface SummaryRow {
  respondent_id: string;
  liked_image_ids: string[];
  summary_text: string;
  tag_frequency: Record<string, number>;
  generated_at: string;
}

/** Platforms whose terms permit us to store/serve a copy of the image. */
export const STORABLE_PLATFORMS: ReadonlySet<SourcePlatform> = new Set([
  "stock_unsplash",
  "stock_pexels",
  "stock_adobe",
  "ai_generated",
  "manual_savee",
  "manual_same_energy",
  "manual_cosmos",
  "manual_pinterest",
  "in_house",
  "placeholder_dev",
]);

/** Platforms that must stay hotlinked per PRD §5 (never re-hosted). */
export const HOTLINK_ONLY_PLATFORMS: ReadonlySet<SourcePlatform> = new Set([
  "arena",
]);
