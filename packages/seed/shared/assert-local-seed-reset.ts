const LOCAL_DATABASE_HOSTS = new Set(["127.0.0.1", "localhost", "::1"]);

export function assertLocalSeedResetAllowed(
  supabaseUrl: string | undefined,
  allowDestructiveReset: string | undefined
): void {
  if (allowDestructiveReset !== "true") {
    throw new Error(
      "全件削除には ALLOW_DESTRUCTIVE_SEED_RESET=true の明示が必要です。"
    );
  }

  if (!supabaseUrl) {
    throw new Error("SUPABASE_URL が設定されていません。");
  }

  let hostname: string;
  try {
    hostname = new URL(supabaseUrl).hostname;
  } catch {
    throw new Error("SUPABASE_URL がURLとして正しくありません。");
  }

  if (!LOCAL_DATABASE_HOSTS.has(hostname)) {
    throw new Error(
      "全件削除seedはローカルSupabase専用です。リモートDBには実行できません。"
    );
  }
}