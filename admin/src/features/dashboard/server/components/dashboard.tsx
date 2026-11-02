import "server-only";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { requireAdmin } from "@/features/auth/server/lib/auth-server";
import { contentLinks } from "../../shared/navigation";

export async function Dashboard() {
  await requireAdmin();
  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <p className="text-sm text-muted-foreground">みらいぎかいっちの更新</p>
        <h1 className="text-2xl font-bold">今日は何を更新しますか？</h1>
        <p className="text-muted-foreground">
          公開サイトの内容から、更新したいものを選んでください。
        </p>
      </header>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {contentLinks.map(({ href, label, description, icon: Icon }) => (
          <Link
            href={href}
            key={href}
            className="group rounded-xl border bg-card p-5 space-y-3 transition-colors hover:border-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring"
          >
            <Icon className="size-6 text-primary" aria-hidden="true" />
            <h2 className="text-lg font-semibold">{label}</h2>
            <p className="text-sm text-muted-foreground">{description}</p>
            <span className="inline-flex items-center gap-2 text-sm font-medium">
              管理画面を開く
              <ArrowRight className="size-4" aria-hidden="true" />
            </span>
          </Link>
        ))}
      </div>
      <section className="rounded-xl border bg-card p-5 space-y-3">
        <h2 className="font-semibold">更新する前に</h2>
        <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
          <li>
            AIが作った文章は、原文・数字・発言者を確認してから保存してください。
          </li>
          <li>
            議事録要約と市長提案理由には下書き状態がありません。保存すると公開サイトに反映され得ます。
          </li>
          <li>
            公開中の会見の項目・発言も、保存すると反映されます。編集中は会見を下書きに戻すことをおすすめします。
          </li>
          <li>
            「議員紹介」は、公開サイトの議員名鑑・紹介ページの内容を管理する画面です。
          </li>
        </ul>
      </section>
    </div>
  );
}
