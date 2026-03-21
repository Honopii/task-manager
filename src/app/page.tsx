import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-dvh bg-slate-50 px-4 py-12">
      <div className="mx-auto flex w-full max-w-3xl flex-col items-center">
        <div className="w-full rounded-2xl border border-slate-200 bg-white p-8 shadow-sm sm:p-10">
          <p className="text-sm font-medium text-slate-600">タスク管理アプリ</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            TaskManager
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-600">
            かんたんにタスクを追加・整理して、やることを見える化します。
          </p>

          <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row">
            <Link
              href="/login"
              className="inline-flex w-full items-center justify-center rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800 sm:w-auto"
            >
              ログイン
            </Link>
            <Link
              href="/signup"
              className="inline-flex w-full items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-900 shadow-sm transition hover:bg-slate-50 sm:w-auto"
            >
              サインアップ
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

