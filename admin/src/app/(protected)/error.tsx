"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Admin page failed:", error);
  }, [error]);
  return (
    <section role="alert" className="space-y-4 rounded-lg border bg-card p-6">
      <h1 className="text-xl font-bold">管理画面を読み込めませんでした</h1>
      <p>
        接続先やDBの設定、検索条件を確認してください。データがない場合とは区別して表示しています。
      </p>
      <p className="text-sm text-muted-foreground">{error.message}</p>
      <div className="flex flex-wrap gap-3">
        <Button onClick={reset}>再試行</Button>
        <Button asChild variant="outline">
          <Link href="/dashboard">ダッシュボードへ</Link>
        </Button>
      </div>
    </section>
  );
}
