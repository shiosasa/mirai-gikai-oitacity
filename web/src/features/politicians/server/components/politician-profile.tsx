import "server-only";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { findCommitteeList } from "@/features/committee-minutes/server/repositories/meeting-repository";
import {
  getPoliticianDiscussions,
  getPublishedPolitician,
} from "../loaders/get-published-politician";
import { parseCommitteeAssignments } from "../../shared/utils/parse-committee-assignments";

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

  const [discussions, committees] = await Promise.all([
    getPoliticianDiscussions(id),
    findCommitteeList(),
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
        議員紹介へ戻る
      </Link>

      <section className="mt-6 border-b border-oita-pink-accent pb-7">
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

        {politician.address && (
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
          {politician.contact && (
            <li className="text-mirai-text-secondary font-mono">
              TEL: {politician.contact}
            </li>
          )}
        </ul>
      </section>

      <section className="pt-7">
        <h2 className="text-lg font-bold text-mirai-text">議会での発言</h2>
        {discussions.length === 0 ? (
          <p className="mt-3 text-sm text-mirai-text-secondary">
            関連する発言はまだ掲載されていません。
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-mirai-border">
            {discussions.map((discussion) => (
              <li key={discussion.id} className="py-4">
                {discussion.bills?.id ? (
                  <Link
                    href={`/bills/${discussion.bills.id}`}
                    className="font-semibold text-primary hover:underline"
                  >
                    {discussion.bills.name}
                  </Link>
                ) : (
                  <p className="font-semibold text-mirai-text">
                    {discussion.bills?.name ?? "関連議案"}
                  </p>
                )}
                {discussion.question_summary && (
                  <p className="mt-2 text-sm leading-6 text-mirai-text">
                    {discussion.question_summary}
                  </p>
                )}
                {discussion.source_url && (
                  <a
                    href={discussion.source_url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                  >
                    議会中継を見る{" "}
                    <ExternalLink aria-hidden="true" className="size-3" />
                  </a>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
