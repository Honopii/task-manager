type RouterWithRefresh = { refresh: () => void };

function isLikelyNetworkFailure(message: string): boolean {
  return /failed to fetch|networkerror|load failed|network request failed/i.test(
    message
  );
}

/**
 * トークンリフレッシュや fetch が一時的に失敗したとき、
 * middleware 経由で Cookie を整えるために router.refresh() してから 1 回だけ再試行する。
 */
export async function runWithSupabaseNetworkRetry(
  router: RouterWithRefresh,
  operation: () => Promise<void>
): Promise<{ ok: true } | { ok: false; message: string }> {
  const tryOnce = async () => {
    await operation();
  };

  try {
    await tryOnce();
    return { ok: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (!isLikelyNetworkFailure(msg)) {
      return { ok: false, message: msg };
    }
    try {
      router.refresh();
      await new Promise((r) => setTimeout(r, 450));
      await tryOnce();
      return { ok: true };
    } catch {
      return {
        ok: false,
        message:
          "Supabase への通信に失敗しました。ネットワーク・VPN・広告ブロッカーを確認し、ページを再読み込みしてからログインし直してください。",
      };
    }
  }
}
