import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { siteConfig } from "@/config/site.config";
import { groupPoliticiansByFaction } from "../../shared/utils/group-politicians-by-faction";
import { getPublishedPoliticians } from "../loaders/get-published-politicians";

export async function PoliticiansDirectory() {
  const politicians = await getPublishedPoliticians();
  // 欠番（name="欠番"）や無効レコードはリポジトリで除外済み
  // 会派別にグルーピングし、会派内で議席番号順に整列
  const factionGroups = groupPoliticiansByFaction(politicians);

  return (
    <main className="mx-auto max-w-5xl px-5 py-10 sm:px-8">
      <header className="mb-8 border-b border-oita-pink-accent pb-5">
        <p className="text-sm font-semibold text-oita-pink">
          {siteConfig.councilName}
        </p>
        <h1 className="mt-2 text-2xl font-bold text-mirai-text">議員紹介</h1>
        <p className="mt-2 text-sm text-mirai-text-secondary">
          会派別に議員を紹介します。会派内は議席番号順です。
        </p>
      </header>

      {factionGroups.length === 0 ? (
        <p className="py-10 text-center text-sm text-mirai-text-secondary">
          掲載できる議員情報は現在ありません。
        </p>
      ) : (
        <div className="space-y-10">
          {factionGroups.map((group) => (
            <section key={group.key} aria-label={group.displayName}>
              <div className="mb-4 flex items-baseline gap-3 border-l-4 border-oita-pink pl-3">
                <h2 className="text-lg font-bold text-mirai-text">
                  {group.displayName}
                </h2>
                <p className="text-xs text-mirai-text-muted">
                  {group.politicians.length}名
                </p>
              </div>
              <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {group.politicians.map((politician) => (
                  <li key={politician.id}>
                    <Card className="h-full rounded-md border-mirai-border bg-card shadow-none">
                      <Link
                        href={`/politicians/${politician.id}`}
                        className="flex h-full gap-4 p-4 outline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
                      >
                        <Avatar className="size-16 shrink-0">
                          <AvatarImage
                            src={politician.image_url ?? undefined}
                            alt=""
                          />
                          <AvatarFallback className="bg-oita-pink-light text-oita-pink">
                            {politician.name.slice(0, 1)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="text-xs text-mirai-text-muted">
                            {politician.name_kana}
                          </p>
                          <h3 className="mt-1 break-words font-bold text-mirai-text">
                            {politician.name}
                          </h3>
                          <p className="mt-2 text-sm text-mirai-text-secondary">
                            {politician.number != null
                              ? `議席${politician.number}番・`
                              : ""}
                            当選{politician.election_count ?? 1}回
                          </p>
                        </div>
                      </Link>
                    </Card>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </main>
  );
}
