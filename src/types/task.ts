export type TaskStatus = "未着手" | "進行中" | "完了";

export type Task = {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  user_id: string;
  created_at: string;
  updated_at: string;
};

