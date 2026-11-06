import { ArrowLeft, ExternalLink } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { findCommitteeList } from "@/features/committee-minutes/server/repositories/meeting-repository";
import { OfficeTermList } from "../../shared/components/office-term-list";
import { PoliticianSpeechSection } from "../../shared/components/politician-speech-section";
import { parseCommitteeAssignments } from "../../shared/utils/parse-committee-assignments";
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

  const [discussions, committees, speechData] = await Promise.all([
    getPoliticianDiscussions(id),
    findCommitteeList(),
    getPoliticianSpeechHighlights(id),
  ]);
  const committeeIdByName = new Map(
    committees.map((committee) => [committee.title, committee.id])
  );

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

        <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm">
          {politician.homepage && (
            <li>
              <a
                href={politician.homepage}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 font-semibold text-primary hover:underline"
              >
                公式サイト{" "}
                <ExternalLink aria-hidden="true" className="size-3.5" />
              </a>
            </li>
          )}
          {politician.is_current && politician.contact && (
            <li className="text-mirai-text-secondary font-mono">
              TEL: {politician.contact}
            </li>
          )}
        </ul>
      </section>
      <OfficeTermList terms={terms} />

      <PoliticianSpeechSection
        highlights={speechData.highlights}
        discussions={discussions}
        invalidCount={speechData.invalidCount}
        isPreview={speechData.isPreview}
      />
    </main>
  );
}
