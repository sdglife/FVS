import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/server";
import type { ImageRow, RespondentRow, SessionRow, SummaryRow } from "@/lib/types";
import { RegenerateButton } from "./RegenerateButton";

export default async function SessionResultsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;

  const db = supabaseAdmin();

  const { data: session } = await db
    .from("sessions")
    .select("*")
    .eq("id", id)
    .single();
  if (!session) notFound();

  const { data: respondent } = await db
    .from("respondents")
    .select("*")
    .eq("session_id", id)
    .maybeSingle();
  if (!respondent) {
    return <p className="p-8">No respondent has started this session yet.</p>;
  }

  const [{ data: summary }, { data: likedSwipes }] = await Promise.all([
    db.from("summaries").select("*").eq("respondent_id", respondent.id).maybeSingle(),
    db.from("swipes").select("image_id").eq("respondent_id", respondent.id).eq("direction", "like"),
  ]);

  const likedImageIds = (likedSwipes ?? []).map((s) => s.image_id as string);
  const { data: likedImages } = likedImageIds.length
    ? await db.from("images").select("*").in("id", likedImageIds)
    : { data: [] as ImageRow[] };

  const typedSession = session as SessionRow;
  const typedRespondent = respondent as RespondentRow;
  const typedSummary = summary as SummaryRow | null;
  const images = (likedImages ?? []) as ImageRow[];

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 px-4 py-8">
      <div>
        <h1 className="text-xl font-semibold">
          {typedRespondent.brand_name} — {typedSession.project_name ?? "Session"}
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          {typedRespondent.name} ·{" "}
          {typedRespondent.email ?? typedRespondent.phone} · keywords:{" "}
          {typedRespondent.chosen_keywords.join(", ")}
          {typedRespondent.custom_keyword_text &&
            ` (also typed: "${typedRespondent.custom_keyword_text}")`}{" "}
          · deck size {typedRespondent.deck_size} · completed{" "}
          {typedRespondent.completed_at
            ? new Date(typedRespondent.completed_at).toLocaleString()
            : "—"}
        </p>
      </div>

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="font-medium">Style summary</h2>
          <RegenerateButton respondentId={typedRespondent.id} sessionId={typedSession.id} />
        </div>
        {typedSummary ? (
          <p className="whitespace-pre-wrap rounded-lg bg-zinc-50 p-4 text-sm leading-relaxed dark:bg-zinc-900">
            {typedSummary.summary_text}
          </p>
        ) : (
          <p className="text-sm text-zinc-500">
            No summary yet — click &quot;Regenerate summary&quot; to generate one.
          </p>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-medium">
          Liked images ({images.length})
          <span className="ml-2 text-xs font-normal text-zinc-500">
            internal reference moodboard — not cleared/licensed creative (PRD §4.3)
          </span>
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {images.map((image) => (
            <figure key={image.id} className="flex flex-col gap-1">
              {/* eslint-disable-next-line @next/next/no-img-element -- hotlinked/external sources, not optimizable via next/image without an allowlist per PRD §5 */}
              <img
                src={image.thumbnail_url ?? image.image_url}
                alt={image.keywords.join(", ")}
                className="aspect-square w-full rounded object-cover"
              />
              <figcaption className="text-xs text-zinc-500">
                {image.source_url ? (
                  <a href={image.source_url} target="_blank" rel="noopener noreferrer" className="underline">
                    {image.license_credit ?? image.source_platform}
                  </a>
                ) : (
                  image.license_credit ?? image.source_platform
                )}
              </figcaption>
            </figure>
          ))}
        </div>
      </section>
    </div>
  );
}
