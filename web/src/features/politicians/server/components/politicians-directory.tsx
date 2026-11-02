import { siteConfig } from "@/config/site.config";
import { MayorDirectoryCard } from "../../client/components/mayor-directory-card";
import { PoliticiansFactionSection } from "../../shared/components/politicians-faction-section";
import { COUNCILLORS_DIRECTORY_HEADING_ID } from "../../shared/utils/faction-directory-links";
import { groupPoliticiansByFaction } from "../../shared/utils/group-politicians-by-faction";
import { getPublishedPoliticians } from "../loaders/get-published-politicians";
import { findCurrentMayor } from "../repositories/mayor-repository";

export async function PoliticiansDirectory() {
  const [politicians, mayor] = await Promise.all([
    getPublishedPoliticians(),
    findCurrentMayor(),
  ]);
  // 欠番（name="欠番"）や無効レコードはリポジトリで除外済み
  // 会派別にグルーピングし、会派内で議席番号順に整列
  const factionGroups = groupPoliticiansByFaction(politicians);

  return (
    <div className="mx-auto max-w-5xl px-5 py-10 sm:px-8">
      <header className="mb-8 border-b border-oita-pink-accent pb-5">
        <p className="text-sm font-semibold text-oita-pink">
          {siteConfig.cityName}
        </p>
        <h1 className="mt-2 text-2xl font-bold text-mirai-text">
          市長・議員紹介
        </h1>
        <p className="mt-2 text-sm text-mirai-text-secondary">
          市長と市議会議員を紹介します。議員は会派別、会派内は議席番号順です。
        </p>
      </header>

      <section aria-labelledby="mayor-directory-heading" className="mb-10">
        <h2
          id="mayor-directory-heading"
          className="mb-4 border-l-4 border-oita-pink pl-3 text-lg font-bold text-mirai-text"
        >
          市長
        </h2>
        <MayorDirectoryCard mayor={mayor} />
      </section>

      <section aria-labelledby={COUNCILLORS_DIRECTORY_HEADING_ID}>
        <h2
          id={COUNCILLORS_DIRECTORY_HEADING_ID}
          className="mb-5 scroll-mt-24 text-lg font-bold text-mirai-text"
        >
          市議会議員
        </h2>
        {factionGroups.length === 0 ? (
          <p className="py-10 text-center text-sm text-mirai-text-secondary">
            掲載できる議員情報は現在ありません。
          </p>
        ) : (
          <div className="space-y-10">
            {factionGroups.map((group) => (
              <PoliticiansFactionSection key={group.key} group={group} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
