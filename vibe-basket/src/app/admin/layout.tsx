import { redirect } from "next/navigation";
import Link from "next/link";
import { isAdminAuthenticated, clearAdminSession } from "@/lib/auth";

async function logout() {
  "use server";
  await clearAdminSession();
  redirect("/admin/login");
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // The login page itself renders through this same layout tree (it's
  // under /admin/login), so only gate when we're not already there.
  // Next.js has no clean "except this child" layout escape, so the guard
  // lives here and simply no-ops when already authenticated or on login.
  const authed = await isAdminAuthenticated();

  return (
    <div className="flex flex-1 flex-col">
      {authed && (
        <header className="flex items-center justify-between border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
          <Link href="/admin" className="font-semibold">
            NF Vibe Check
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/admin/import">Manual import</Link>
            <form action={logout}>
              <button type="submit" className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100">
                Sign out
              </button>
            </form>
          </nav>
        </header>
      )}
      <main className="flex flex-1 flex-col">{children}</main>
    </div>
  );
}
