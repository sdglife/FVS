"use client";

import { useActionState } from "react";
import { importManualImage } from "./actions";

const PLATFORMS: { value: string; label: string }[] = [
  { value: "manual_savee", label: "Savee" },
  { value: "manual_same_energy", label: "Same.Energy" },
  { value: "manual_cosmos", label: "Cosmos.so" },
  { value: "manual_pinterest", label: "Pinterest" },
];

export function ImportForm({
  groups,
}: {
  groups: [string, { slug: string; label: string }[]][];
}) {
  const [error, formAction, pending] = useActionState(importManualImage, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1 text-sm">
        Source platform
        <select
          name="source_platform"
          required
          className="rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
        >
          {PLATFORMS.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Image URL (the direct image file)
        <input
          name="image_url"
          type="url"
          required
          className="rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Source URL (the page you found it on — required for credit/attribution)
        <input
          name="source_url"
          type="url"
          required
          className="rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        License / credit line (optional)
        <input
          name="license_credit"
          placeholder="e.g. via Savee · original by @artist"
          className="rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
        />
      </label>

      <fieldset className="flex flex-col gap-2 text-sm">
        <legend className="mb-1 font-medium">Keywords (pick what fits)</legend>
        {groups.map(([group, keywords]) => (
          <div key={group}>
            <p className="text-xs uppercase tracking-wide text-zinc-500">{group}</p>
            <div className="flex flex-wrap gap-3 py-1">
              {keywords.map((kw) => (
                <label key={kw.slug} className="flex items-center gap-1">
                  <input type="checkbox" name="keywords" value={kw.slug} />
                  {kw.label}
                </label>
              ))}
            </div>
          </div>
        ))}
      </fieldset>

      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-full bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-white dark:text-black"
      >
        {pending ? "Saving…" : "Save image"}
      </button>
    </form>
  );
}
