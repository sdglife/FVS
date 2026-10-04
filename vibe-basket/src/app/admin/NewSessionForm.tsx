"use client";

import { useActionState } from "react";
import { createSession } from "./actions";

export function NewSessionForm() {
  const [error, formAction, pending] = useActionState(createSession, undefined);

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-2">
      <label className="flex flex-col gap-1 text-sm">
        Project / client name (optional, for your own reference)
        <input
          name="project_name"
          placeholder="e.g. Acme Coffee Co."
          className="w-64 rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
        />
      </label>
      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-white dark:text-black"
      >
        {pending ? "Creating…" : "New session"}
      </button>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </form>
  );
}
