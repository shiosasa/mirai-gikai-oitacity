/**
 * 環境変数の設定
 * アプリケーション全体で使用する環境変数を一元管理
 */

import { resolveWebUrl } from "./utils/resolve-web-url";

const isBuildTime =
  process.env.NEXT_PHASE === "phase-production-build" ||
  process.env.npm_lifecycle_event === "build" ||
  process.env.NODE_ENV === "production";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  (isBuildTime ? "https://placeholder.supabase.co" : "");

const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  (isBuildTime ? "placeholder-anon-key" : "");

if (!supabaseUrl) {
  throw new Error("環境変数 NEXT_PUBLIC_SUPABASE_URL が設定されていません");
}
if (!supabaseAnonKey) {
  throw new Error(
    "環境変数 NEXT_PUBLIC_SUPABASE_ANON_KEY が設定されていません"
  );
}

export const env = {
  webUrl: resolveWebUrl(
    process.env.NEXT_PUBLIC_WEB_URL,
    process.env.VERCEL === "1"
  ),
  supabaseUrl,
  supabaseAnonKey,
  revalidateSecret: process.env.REVALIDATE_SECRET,
  langfuse: {
    publicKey: process.env.LANGFUSE_PUBLIC_KEY,
    secretKey: process.env.LANGFUSE_SECRET_KEY,
    baseUrl: process.env.LANGFUSE_BASE_URL || "https://cloud.langfuse.com",
  },
} as const;

// 型定義
export type Env = typeof env;
