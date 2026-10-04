import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/server";
import type { RespondentRow, SessionRow } from "@/lib/types";
import { NewSessionForm } from "./NewSessionForm";
import { CopyLinkButton } from "./CopyLinkButton";

export default async function AdminDashboard() {
  await requireAdmin();

  const db = supabaseAdmin();
  const { data: sessions, error } = await db
    .from("sessions")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;

  const sessionRows = (sessions ?? []) as SessionRow[];

  // v1 is one link = one respondent (PRD §10 decision #5), so at most one
  // respondent row exists per session — fetch them all in one query rather
  // than N+1.
  const respondentBySession = new Map<string, RespondentRow>();
  if (sessionRows.length > 0) {
    const { data: respondents, error: respondentsError } = await db
      .from("respondents")
      .select("*")
      .in("session_id", sessionRows.map((s) => s.id));
    if (respondentsError) throw respondentsError;

    for (const r of (respondents ?? []) as RespondentRow[]) {
      respondentBySession.set(r.session_id, r);
    }
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-8">
      <h1 className="text-xl font-semibold">Sessions</h1>
      <NewSessionForm />

      <ul className="flex flex-col gap-3">
        {sessionRows.map((session) => {
          const respondent = respondentBySession.get(session.id);
          const shareUrl = `${appUrl}/s/${session.share_token}`;

          return (
            <li
              key={session.id}
              className="flex flex-col gap-2 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium">
                  {session.project_name ?? "Untitled session"}
                </span>
                <span className="text-xs text-zinc-500">{session.status}</span>
              </div>

              {respondent ? (
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  {respondent.name} · {respondent.brand_name} ·{" "}
                  {respondent.completed_at ? "completed" : "in progress"}
                </p>
              ) : (
                <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                  <span className="truncate">{shareUrl}</span>
                  <CopyLinkButton url={shareUrl} />
                </div>
              )}

              {respondent?.completed_at && (
                <Link
                  href={`/admin/sessions/${session.id}`}
                  className="text-sm font-medium underline"
                >
                  View results →
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
