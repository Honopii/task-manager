"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import TaskForm from "@/src/components/TaskForm";
import { getSupabase } from "@/src/lib/supabase";
import type { Task, TaskStatus } from "@/src/types/task";

export default function DashboardPage() {
  const router = useRouter();

  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");

  const fetchTasks = async () => {
    setErrorMessage(null);

    let supabase;
    try {
      supabase = getSupabase();
    } catch (e) {
      setErrorMessage(
        e instanceof Error ? e.message : "Supabase の設定に失敗しました。"
      );
      setTasks([]);
      return;
    }

    const { data: tasksData, error: tasksError } = await supabase
      .from("tasks")
      .select("*")
      .order("created_at", { ascending: false });

    if (tasksError) {
      setErrorMessage(tasksError.message);
      setTasks([]);
      return;
    }

    setTasks((tasksData ?? []) as Task[]);
  };

  useEffect(() => {
    let cancelled = false;

    const loadUserAndTasks = async () => {
      setLoading(true);
      setErrorMessage(null);

      try {
        let supabase;
        try {
          supabase = getSupabase();
        } catch (e) {
          if (!cancelled) {
            setErrorMessage(
              e instanceof Error ? e.message : "Supabase の設定に失敗しました。"
            );
          }
          return;
        }

        const { data, error } = await supabase.auth.getUser();

        if (cancelled) return;

        if (error) {
          setErrorMessage(error.message);
          router.replace("/login");
          return;
        }

        const user = data.user;
        if (!user) {
          router.replace("/login");
          return;
        }

        setEmail(user.email ?? null);
        await fetchTasks();
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void loadUserAndTasks();

    return () => {
      cancelled = true;
    };
  }, [router]);

  const onDeleteTask = async (taskId: string) => {
    const confirmed = window.confirm("このタスクを削除しますか？");
    if (!confirmed) return;

    setErrorMessage(null);

    try {
      const supabase = getSupabase();
      const { error } = await supabase.from("tasks").delete().eq("id", taskId);
      if (error) {
        setErrorMessage(error.message);
        return;
      }

      await fetchTasks();
    } catch (e) {
      setErrorMessage(
        e instanceof Error ? e.message : "削除に失敗しました。"
      );
    }
  };

  const onStartEdit = (task: Task) => {
    setEditingTaskId(task.id);
    setEditTitle(task.title);
    setEditDescription(task.description ?? "");
  };

  const onCancelEdit = () => {
    setEditingTaskId(null);
    setEditTitle("");
    setEditDescription("");
  };

  const onSaveEdit = async (taskId: string) => {
    if (!editTitle.trim()) return;

    setErrorMessage(null);
    try {
      const supabase = getSupabase();
      const { error } = await supabase
        .from("tasks")
        .update({
          title: editTitle.trim(),
          description: editDescription.trim() ? editDescription.trim() : null,
        })
        .eq("id", taskId);

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      onCancelEdit();
      await fetchTasks();
    } catch (e) {
      setErrorMessage(
        e instanceof Error ? e.message : "保存に失敗しました。"
      );
    }
  };

  const onChangeTaskStatus = async (taskId: string, status: TaskStatus) => {
    setErrorMessage(null);
    try {
      const supabase = getSupabase();
      const { error } = await supabase
        .from("tasks")
        .update({ status })
        .eq("id", taskId);

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      await fetchTasks();
    } catch (e) {
      setErrorMessage(
        e instanceof Error ? e.message : "ステータス更新に失敗しました。"
      );
    }
  };

  const truncateDescription = (description: string | null) => {
    if (!description) return null;
    return description.length > 50 ? `${description.slice(0, 50)}…` : description;
  };

  const statuses: TaskStatus[] = ["未着手", "進行中", "完了"];
  const tasksByStatus = statuses.reduce<Record<TaskStatus, Task[]>>(
    (acc, status) => {
      acc[status] = tasks.filter((t) => t.status === status);
      return acc;
    },
    { 未着手: [], 進行中: [], 完了: [] }
  );

  const columnStyles: Record<TaskStatus, string> = {
    未着手: "bg-slate-100/80 border-slate-200",
    進行中: "bg-blue-50/80 border-blue-200",
    完了: "bg-emerald-50/80 border-emerald-200",
  };

  return (
    <main className="min-h-[calc(100dvh-3.5rem)] bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">
            ダッシュボード
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            {loading ? (
              "読み込み中..."
            ) : (
              <>ようこそ、{email ?? "ユーザー"}さん</>
            )}
          </p>
        </div>

        {errorMessage && (
          <div
            role="alert"
            className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {errorMessage}
          </div>
        )}

        <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-base font-semibold text-slate-900">
            新しいタスク
          </h2>
          <div className="mt-4">
            <TaskForm onTaskCreated={fetchTasks} />
          </div>
        </div>

        {!loading && !errorMessage && tasks.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center text-slate-600">
            タスクがありません。上のフォームから作成してください。
          </div>
        )}

        {!loading && tasks.length > 0 && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {statuses.map((status) => (
              <section
                key={status}
                className={`min-h-[200px] rounded-2xl border-2 p-4 ${columnStyles[status]}`}
              >
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-base font-semibold text-slate-900">
                    {status}
                  </h2>
                  <span className="rounded-full bg-white/80 px-2.5 py-0.5 text-sm font-medium text-slate-600 shadow-sm">
                    {tasksByStatus[status].length}件
                  </span>
                </div>
                <div className="space-y-3">
                  {tasksByStatus[status].length === 0 ? (
                    <div className="rounded-xl border border-dashed border-slate-300 bg-white/60 px-4 py-8 text-center text-sm text-slate-500">
                      タスクがありません
                    </div>
                  ) : (
                    tasksByStatus[status].map((task) => (
                      <div
                        key={task.id}
                        className="rounded-xl border border-slate-200 bg-white p-4 shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
                      >
                          {editingTaskId === task.id ? (
                            <div className="space-y-3">
                              <input
                                type="text"
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                                placeholder="タイトル"
                              />
                              <textarea
                                value={editDescription}
                                onChange={(e) => setEditDescription(e.target.value)}
                                rows={3}
                                className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                                placeholder="説明（任意）"
                              />
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={onCancelEdit}
                                  className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
                                >
                                  キャンセル
                                </button>
                                <button
                                  type="button"
                                  disabled={!editTitle.trim()}
                                  onClick={() => onSaveEdit(task.id)}
                                  className="rounded-md bg-slate-900 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                  保存
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="flex items-start justify-between gap-3">
                                <h3 className="text-sm font-semibold text-slate-900">
                                  {task.title}
                                </h3>
                                <div className="flex items-center gap-2">
                                  <select
                                    value={task.status}
                                    onChange={(e) =>
                                      onChangeTaskStatus(
                                        task.id,
                                        e.target.value as TaskStatus
                                      )
                                    }
                                    className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-slate-700 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                                  >
                                    {statuses.map((statusOption) => (
                                      <option key={statusOption} value={statusOption}>
                                        {statusOption}
                                      </option>
                                    ))}
                                  </select>
                                  <button
                                    type="button"
                                    onClick={() => onStartEdit(task)}
                                    className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-medium text-slate-700 transition hover:bg-slate-100"
                                  >
                                    編集
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => onDeleteTask(task.id)}
                                    className="rounded-md border border-red-200 bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700 transition hover:bg-red-100"
                                  >
                                    削除
                                  </button>
                                </div>
                              </div>
                              {truncateDescription(task.description) && (
                                <p className="mt-2 text-sm leading-6 text-slate-600">
                                  {truncateDescription(task.description)}
                                </p>
                              )}
                            </>
                          )}
                        </div>
                      ))
                    )}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

