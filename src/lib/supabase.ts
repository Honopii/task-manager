import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * ブラウザ用 Supabase クライアント。
 * @supabase/ssr の createBrowserClient がブラウザではシングルトンになるため、
 * ここでは毎回呼び出して同一インスタンスを返す。
 * セッションは Cookie（document.cookie）に保持され、middleware で更新される。
 */
export function getSupabase(): SupabaseClient {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl) {
    throw new Error(
      "環境変数 NEXT_PUBLIC_SUPABASE_URL が設定されていません。.env.local に記載し、開発サーバー（npm run dev）を再起動してください。"
    );
  }

  if (!supabaseAnonKey) {
    throw new Error(
      "環境変数 NEXT_PUBLIC_SUPABASE_ANON_KEY が設定されていません。.env.local に記載し、開発サーバー（npm run dev）を再起動してください。"
    );
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
