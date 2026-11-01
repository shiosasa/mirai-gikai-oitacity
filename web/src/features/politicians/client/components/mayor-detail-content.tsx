import { ArrowLeft, ChevronDown, ExternalLink } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDateJST } from "@/lib/utils/date";
import { getHttpUrl } from "@/lib/utils/external-url";
import type {
  MayorConference,
  MayorProfile,
  MayorProposal,
} from "../../shared/types/mayor";
import { calculateAge } from "../../shared/utils/calculate-age";
import { MayorConferenceArchive } from "./mayor-conference-archive";
import { MayorPolicyPillars } from "./mayor-policy-pillars";

type Props = {
  mayor: MayorProfile | null;
  proposals: MayorProposal[];
  conferences: MayorConference[];
  localPreview: boolean;
};

export function MayorDetailContent({
  mayor,
  proposals,
  conferences,
  localPreview,
}: Props) {
  const officialUrl = getHttpUrl(mayor?.official_url);
  const imageUrl = getHttpUrl(mayor?.image_url);
  const mayorName = mayor?.name?.trim();
  const age = calculateAge(mayor?.birth_date ?? null, new Date());

  return (
    <div className="mx-auto max-w-3xl px-5 py-10 sm:px-8">
      <Link
        href="/politicians"
        className="inline-flex items-center gap-2 text-sm font-semibold text-mirai-text-secondary hover:text-mirai-text"
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        市長・議員紹介へ戻る
      </Link>

      {localPreview && (
        <p
          role="note"
          className="mt-5 rounded-lg border border-oita-pink bg-oita-pink-light p-4 text-sm text-mirai-text"
        >
          ローカル確認用：記者会見の下書きを含みます。一般公開はされていません。
        </p>
      )}

      <header className="mb-8 mt-6 border-b border-oita-pink-accent pb-6">
        <p className="text-sm font-semibold text-mirai-text-secondary">
          大分市
        </p>
        <h1 className="mt-2 text-2xl font-bold text-mirai-text">市長紹介</h1>
        <p className="mt-3 text-sm leading-6 text-mirai-text-secondary">
          市長のプロフィール、議会への提案理由、記者会見を紹介します。
        </p>
        <nav aria-label="市長紹介の目次" className="mt-5">
          <ul className="flex flex-wrap gap-2 text-sm">
            {[
              ["#profile", "プロフィール"],
              ["#proposals", "提案理由"],
              ["#press-conferences", "記者会見"],
            ].map(([href, label]) => (
              <li key={href}>
                <a
                  href={href}
                  className="inline-flex rounded-full border border-mirai-border bg-card px-3 py-1.5 font-semibold text-mirai-text-secondary hover:border-primary"
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      <div className="space-y-10">
        <section id="profile" aria-labelledby="mayor-profile-heading">
          <h2
            id="mayor-profile-heading"
            className="border-l-4 border-oita-pink pl-3 text-xl font-bold text-mirai-text"
          >
            市長プロフィール
          </h2>
          <div className="mt-4 rounded-lg border border-mirai-border bg-card p-5 sm:p-6">
            <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:text-left">
              <Avatar className="size-36 shrink-0 sm:size-48">
                <AvatarImage src={imageUrl ?? undefined} alt="" />
                <AvatarFallback className="bg-oita-pink-light text-2xl text-mirai-text">
                  {mayorName?.slice(0, 1) ?? "市"}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="text-sm text-mirai-text-secondary">大分市長</p>
                {mayor?.name_kana && (
                  <p className="mt-1 text-xs text-mirai-text-secondary">
                    {mayor.name_kana}
                  </p>
                )}
                <h3 className="mt-1 break-words text-xl font-bold text-mirai-text">
                  {mayorName || "プロフィールを準備中です"}
                </h3>
              </div>
            </div>

            {mayor && (
              <dl className="mt-5 grid gap-2 text-sm text-mirai-text-secondary">
                {mayor.birth_date && (
                  <>
                    <div className="flex flex-wrap gap-x-3">
                      <dt className="font-semibold text-mirai-text">
                        生年月日
                      </dt>
                      <dd>{mayor.birth_date}</dd>
                    </div>
                    <div className="flex flex-wrap gap-x-3">
                      <dt className="font-semibold text-mirai-text">年齢</dt>
                      <dd>{age === null ? "確認できません" : `${age}歳`}</dd>
                    </div>
                  </>
                )}
                {mayor.start_date && (
                  <div className="flex flex-wrap gap-x-3">
                    <dt className="font-semibold text-mirai-text">就任日</dt>
                    <dd>{formatDateJST(mayor.start_date)}</dd>
                  </div>
                )}
                {mayor.term_number != null && (
                  <div className="flex flex-wrap gap-x-3">
                    <dt className="font-semibold text-mirai-text">期数</dt>
                    <dd>{mayor.term_number}期目</dd>
                  </div>
                )}
              </dl>
            )}

            {mayor?.bio && (
              <p className="mt-5 whitespace-pre-line text-sm leading-7 text-mirai-text">
                {mayor.bio}
              </p>
            )}

            <MayorPolicyPillars bio={mayor?.bio ?? null} />

            {officialUrl ? (
              <a
                href={officialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-primary-accent hover:underline"
              >
                大分市公式サイトの市長室を見る
                <ExternalLink aria-hidden="true" className="size-4" />
              </a>
            ) : (
              mayor?.official_url && (
                <p className="mt-5 text-sm text-mirai-text-secondary">
                  公式サイトのURLを確認できません。
                </p>
              )
            )}
          </div>
        </section>

        <section id="proposals" aria-labelledby="mayor-proposals-heading">
          <div className="border-l-4 border-oita-pink pl-3">
            <h2
              id="mayor-proposals-heading"
              className="text-xl font-bold text-mirai-text"
            >
              市議会への提案理由
            </h2>
            <p className="mt-2 text-sm leading-6 text-mirai-text-secondary">
              定例会などで市長が説明した提案理由の要点を紹介します。
            </p>
          </div>
          {proposals.length === 0 ? (
            <p className="mt-4 rounded-lg border border-mirai-border bg-card p-5 text-sm text-mirai-text-secondary">
              提案理由は準備中です。
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {proposals.map((proposal) => {
                const sourceUrl = getHttpUrl(
                  proposal.mayor_proposal_source_url
                );
                return (
                  <li key={proposal.id}>
                    <details className="group rounded-lg border border-mirai-border bg-card">
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 outline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary">
                        <h3 className="min-w-0 font-bold text-mirai-text">
                          {proposal.date && (
                            <span className="block text-xs font-normal text-mirai-text-secondary">
                              {formatDateJST(proposal.date)}
                            </span>
                          )}
                          <span className="mt-1 block">
                            {proposal.title || "会議名は準備中です"}
                          </span>
                        </h3>
                        <ChevronDown
                          aria-hidden="true"
                          className="size-5 shrink-0 text-mirai-text-secondary transition-transform group-open:rotate-180"
                        />
                      </summary>
                      <div className="border-t border-mirai-border px-5 py-5">
                        <p className="whitespace-pre-line break-words text-sm leading-7 text-mirai-text">
                          {proposal.mayor_proposal_summary ||
                            "要約は準備中です。"}
                        </p>
                        {proposal.mayor_proposal_source_url && !sourceUrl && (
                          <p className="mt-3 text-sm text-mirai-text-secondary">
                            原文のURLを確認できません。
                          </p>
                        )}
                        <a
                          href={
                            sourceUrl ??
                            "https://www.city.oita.oita.jp/shisejoho/kekakuzaise/shinozaise/teanriyu/index.html"
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary-accent hover:underline"
                        >
                          {sourceUrl
                            ? "公式サイトで原文を見る"
                            : "公式サイトで提案理由を探す"}
                          <ExternalLink aria-hidden="true" className="size-4" />
                        </a>
                      </div>
                    </details>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <MayorConferenceArchive conferences={conferences} />
      </div>
    </div>
  );
}
