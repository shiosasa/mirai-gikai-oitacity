import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  ExternalLink,
  Globe,
  MessageSquare,
  Share2,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { findCommitteeList } from "@/features/committee-minutes/server/repositories/meeting-repository";
import { findPublishedGeneralQuestionsByPoliticianId } from "@/features/general-questions/server/repositories/general-questions-repository";
import { OfficeTermList } from "../../shared/components/office-term-list";
import { PoliticianSpeechSection } from "../../shared/components/politician-speech-section";
import { parseCommitteeAssignments } from "../../shared/utils/parse-committee-assignments";
import {
  collectPoliticianLinks,
  POLITICIAN_LINKS_FAIRNESS_NOTICE,
  type PoliticianLinkPlatform,
} from "../../shared/utils/politician-links";
import { getPoliticianSpeechHighlights } from "../loaders/get-politician-speech-highlights";
import {
  getPoliticianDiscussions,
  getPublishedPolitician,
} from "../loaders/get-published-politician";
import { findOfficeTerms } from "../repositories/office-history-repository";

type PoliticianProfileProps = {
  id: string;
};

function CommitteeAssignments({
  value,
  committeeIdByName,
}: {
  value: string;
  committeeIdByName: Map<string, number>;
}) {
  const assignments = parseCommitteeAssignments(value);

  return (
    <p className="mt-2 text-sm text-mirai-text-secondary">
      {assignments.map((assignment, index) => {
        const committeeId = committeeIdByName.get(assignment.committeeName);
        return (
          <span key={assignment.label}>
            {index > 0 && "、"}
            {committeeId ? (
              <Link
                href={`/committees/committee/${committeeId}`}
                className="font-semibold text-primary hover:underline"
              >
                {assignment.label}
              </Link>
            ) : (
              assignment.label
            )}
          </span>
        );
      })}
    </p>
  );
}

export async function PoliticianProfile({ id }: PoliticianProfileProps) {
  const politician = await getPublishedPolitician(id);
  if (!politician) notFound();
  const terms = (await findOfficeTerms()).filter(
    (term) => term.politician_id === id
  );
  if (!politician.is_current && terms.length === 0) notFound();

  const [discussions, committees, speechData, generalQuestions] =
    await Promise.all([
      getPoliticianDiscussions(id),
      findCommitteeList(),
      getPoliticianSpeechHighlights(id),
      findPublishedGeneralQuestionsByPoliticianId(id),
    ]);
  const committeeIdByName = new Map(
    committees.map((committee) => [committee.title, committee.id])
  );
  const profileLinks = collectPoliticianLinks({
    homepage: politician.homepage,
    blog_url: politician.blog_url,
    sns_links: politician.sns_links,
  });

  function renderPlatformIcon(platform: PoliticianLinkPlatform) {
    if (platform === "homepage") {
      return <Globe aria-hidden="true" className="size-4 shrink-0" />;
    }
    if (platform === "blog" || platform === "note") {
      return <BookOpen aria-hidden="true" className="size-4 shrink-0" />;
    }
    return <Share2 aria-hidden="true" className="size-4 shrink-0" />;
  }

  return (
    <main className="mx-auto max-w-3xl px-5 py-10 sm:px-8">
      <Link
        href="/politicians"
        className="inline-flex items-center gap-2 text-sm font-semibold text-mirai-text-secondary hover:text-mirai-text"
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        市長・議員紹介へ戻る
      </Link>

      <section className="mt-6 border-b border-oita-pink-accent pb-7">
        {!politician.is_current && (
          <p className="mb-4 font-semibold text-mirai-text">
            元大分市議会議員（以下は退任時点の紹介情報です）
          </p>
        )}
        <div className="flex items-center gap-5">
          <Avatar className="size-20 shrink-0">
            <AvatarImage src={politician.image_url ?? undefined} alt="" />
            <AvatarFallback className="bg-oita-pink-light text-xl text-oita-pink">
              {politician.name.slice(0, 1)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="text-sm text-mirai-text-muted">
              {politician.name_kana}
            </p>
            <h1 className="mt-1 break-words text-2xl font-bold text-mirai-text">
              {politician.name}
            </h1>
            <p className="mt-2 text-sm text-mirai-text-secondary">
              当選{politician.election_count ?? 1}回
              {politician.faction ? `・${politician.faction}` : "・無所属"}
            </p>
          </div>
        </div>

        {politician.standing_committee && (
          <div className="mt-5">
            <h2 className="text-sm font-semibold text-mirai-text">
              常任委員会
            </h2>
            <CommitteeAssignments
              value={politician.standing_committee}
              committeeIdByName={committeeIdByName}
            />
          </div>
        )}

        {politician.special_committee && (
          <div className="mt-5">
            <h2 className="text-sm font-semibold text-mirai-text">
              特別委員会
            </h2>
            <CommitteeAssignments
              value={politician.special_committee}
              committeeIdByName={committeeIdByName}
            />
          </div>
        )}

        {politician.is_current && politician.address && (
          <div className="mt-5">
            <h2 className="text-sm font-semibold text-mirai-text">住所</h2>
            <p className="mt-2 text-sm text-mirai-text-secondary">
              {politician.address}
            </p>
          </div>
        )}

        {politician.is_current && politician.contact && (
          <p className="mt-5 text-sm font-mono text-mirai-text-secondary">
            TEL: {politician.contact}
          </p>
        )}

        {politician.is_current &&
          (politician.address || politician.contact) && (
            <p className="mt-4 text-xs text-mirai-text-muted">
              ※
              住所・電話番号などの基本情報は大分市議会ホームページからの転載です。
            </p>
          )}
      </section>

      <section
        aria-labelledby="politician-links-heading"
        className="border-b border-mirai-border py-7"
      >
        <h2
          id="politician-links-heading"
          className="text-lg font-bold text-mirai-text"
        >
          議員本人の日々の発信・活動報告はこちら
        </h2>
        {profileLinks.length > 0 ? (
          <ul className="mt-4 flex flex-wrap gap-3">
            {profileLinks.map((item) => (
              <li key={item.url}>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg border border-oita-pink-accent bg-card px-4 py-2 text-sm font-semibold text-mirai-text transition-colors hover:border-primary hover:bg-oita-pink-light"
                >
                  {renderPlatformIcon(item.platform)}
                  <span>{item.label}</span>
                  <ExternalLink
                    aria-hidden="true"
                    className="size-3.5 text-mirai-text-secondary"
                  />
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-mirai-text-secondary">
            現在、公開されている公式HP・ブログ・SNSの登録はありません。
          </p>
        )}
        <p className="mt-4 rounded-lg border border-mirai-border bg-mirai-surface p-3 text-xs leading-5 text-mirai-text-secondary">
          {POLITICIAN_LINKS_FAIRNESS_NOTICE}
        </p>
      </section>

      {generalQuestions.length > 0 && (
        <section
          aria-labelledby="politician-gq-heading"
          className="border-b border-mirai-border py-7"
        >
          <h2
            id="politician-gq-heading"
            className="flex items-center gap-2 text-lg font-bold text-mirai-text"
          >
            <MessageSquare aria-hidden="true" className="size-5 text-primary" />
            一般質問（一問一答）
          </h2>
          <div className="mt-4 space-y-3">
            {generalQuestions.map((gq) => (
              <Link
                key={gq.id}
                href={`/general-questions?id=${gq.id}`}
                className="flex items-center justify-between gap-4 rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary hover:bg-oita-pink-light/30"
              >
                <div className="min-w-0 space-y-1">
                  <p className="text-sm font-bold text-mirai-text">
                    {gq.topics.map((t) => t.title).join(" / ") || "一般質問"}
                  </p>
                  {gq.summary ? (
                    <p className="line-clamp-2 text-xs text-mirai-text-secondary">
                      {gq.summary}
                    </p>
                  ) : null}
                </div>
                <span className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-primary">
                  一問一答を見る
                  <ArrowRight aria-hidden="true" className="size-3.5" />
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <PoliticianSpeechSection
        highlights={speechData.highlights}
        discussions={discussions}
        invalidCount={speechData.invalidCount}
        isPreview={speechData.isPreview}
      />

      <OfficeTermList terms={terms} />
    </main>
  );
}
