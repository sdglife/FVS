import { requireAdmin } from "@/lib/auth";
import { KEYWORD_TAXONOMY } from "@/lib/keywords";
import { ImportForm } from "./ImportForm";

export default async function ManualImportPage() {
  await requireAdmin();

  const groups = new Map<string, { slug: string; label: string }[]>();
  for (const kw of KEYWORD_TAXONOMY) {
    const list = groups.get(kw.group) ?? [];
    list.push({ slug: kw.slug, label: kw.label });
    groups.set(kw.group, list);
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 px-4 py-8">
      <h1 className="text-xl font-semibold">Manual image import</h1>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        For Savee, Same.Energy, Cosmos.so, and Pinterest only — these
        platforms don&apos;t permit automated collection (PRD §5), so each
        image is browsed and entered by hand, one at a time, with its
        source credited.
      </p>
      <ImportForm groups={[...groups.entries()]} />
    </div>
  );
}
