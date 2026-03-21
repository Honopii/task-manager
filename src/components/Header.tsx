"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { getSupabase } from "@/src/lib/supabase";

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const isDashboard = pathname === "/dashboard";

  const handleLogout = async () => {
    try {
      const supabase = getSupabase();
      await supabase.auth.signOut();
      router.replace("/login");
    } catch {
      router.replace("/login");
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white shadow-sm">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="text-lg font-bold tracking-tight text-slate-900 transition hover:text-slate-700"
        >
          TaskManager
        </Link>
        <nav className="flex items-center gap-3">
          {isDashboard ? (
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              ログアウト
            </button>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                ログイン
              </Link>
              <Link
                href="/signup"
                className="rounded-lg bg-slate-900 px-3 py-1.5 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800"
              >
                サインアップ
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
