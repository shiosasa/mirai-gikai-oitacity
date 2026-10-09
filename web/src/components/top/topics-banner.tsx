import { ArrowRight, Newspaper } from "lucide-react";
import Link from "next/link";

export function TopicsBanner() {
  return (
    <Link
      href="/topics"
      className="flex items-center justify-between gap-4 bg-card border border-border rounded-lg px-5 py-4 hover:border-primary transition-colors"
    >
      <div className="flex items-start gap-3">
        <Newspaper className="w-6 h-6 text-primary shrink-0 mt-0.5" />
        <div>
          <p className="font-bold text-mirai-text">トピックス</p>
          <p className="mt-0.5 text-sm text-mirai-text-secondary">
            議会で話し合われている政策や課題を、わかりやすく翻訳した記事です
          </p>
        </div>
      </div>
      <ArrowRight className="w-5 h-5 text-mirai-text-muted shrink-0" />
    </Link>
  );
}
