import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase/server";
import { KEYWORD_TAXONOMY } from "@/lib/keywords";
import { DECK_SIZES } from "@/lib/types";
import { Wizard } from "./Wizard";

export default async function SwipePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const db = supabaseAdmin();
  const { data: session } = await db
    .from("sessions")
    .select("id, status")
    .eq("share_token", token)
    .maybeSingle();

  if (!session) notFound();

  if (session.status === "completed") {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 text-center">
        <h1 className="text-lg font-semibold">This link has already been used</h1>
        <p className="text-sm text-zinc-500">
          Ask whoever sent you this for a new link.
        </p>
      </div>
    );
  }

  const groups: [string, { slug: string; label: string }[]][] = [];
  const groupIndex = new Map<string, number>();
  for (const kw of KEYWORD_TAXONOMY) {
    let idx = groupIndex.get(kw.group);
    if (idx === undefined) {
      idx = groups.length;
      groups.push([kw.group, []]);
      groupIndex.set(kw.group, idx);
    }
    groups[idx][1].push({ slug: kw.slug, label: kw.label });
  }

  return (
    <Wizard token={token} keywordGroups={groups} deckSizes={DECK_SIZES} />
  );
}
