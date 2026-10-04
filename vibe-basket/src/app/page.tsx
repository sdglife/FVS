import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 bg-zinc-50 px-6 text-center dark:bg-black">
      <h1 className="text-3xl font-semibold tracking-tight">NF Vibe Check</h1>
      <p className="max-w-sm text-zinc-600 dark:text-zinc-400">
        Swipe on reference images to show your brand&apos;s visual vibe — no
        more guessing from buzzwords.
      </p>
      <Link
        href="/admin"
        className="rounded-full bg-black px-5 py-2.5 text-sm font-medium text-white dark:bg-white dark:text-black"
      >
        Admin sign in
      </Link>
    </div>
  );
}
