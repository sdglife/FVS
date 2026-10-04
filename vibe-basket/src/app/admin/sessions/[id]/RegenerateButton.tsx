"use client";

import { useState } from "react";
import { regenerateSummary } from "./actions";

export function RegenerateButton({
  respondentId,
  sessionId,
}: {
  respondentId: string;
  sessionId: string;
}) {
  const [pending, setPending] = useState(false);

  return (
    <button
      type="button"
      disabled={pending}
      onClick={async () => {
        setPending(true);
        try {
          await regenerateSummary(respondentId, sessionId);
        } finally {
          setPending(false);
        }
      }}
      className="rounded border border-zinc-300 px-3 py-1.5 text-sm disabled:opacity-50 dark:border-zinc-700"
    >
      {pending ? "Regenerating…" : "Regenerate summary"}
    </button>
  );
}
