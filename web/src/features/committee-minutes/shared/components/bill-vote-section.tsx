import { ExternalLink } from "lucide-react";
import Link from "next/link";
import type {
  BillVoteResult,
  BillVoteSnapshot,
  DisplayVote,
  MemberVote,
} from "../types/bill-vote";
import { getVotePersonHref, groupBillVotes } from "../utils/bill-votes";

const RESULT_LABELS: Record<BillVoteResult, string> = {
  for: "賛成",
  against: "反対",
  absent: "欠席",
  withdrawn: "退席",
  excluded: "法律上、採決に加われない",
  chair: "議長（採決に参加せず）",
};

function PersonName({
  vote,
  profiles,
}: {
  vote: MemberVote;
  profiles: ReadonlyMap<string, string>;
}) {
  const href = getVotePersonHref(vote, profiles);
  return (
    <>
      {href ? (
        <Link
          className="text-mirai-text underline decoration-primary-accent underline-offset-2"
          href={href}
        >
          {vote.name}
        </Link>
      ) : (
        <span>{vote.name}</span>
      )}
      <span className="text-mirai-text-secondary">
        （{vote.faction || "無所属"}）
      </span>
    </>
  );
}

function VoteList({
  title,
  count,
  entries,
  profiles,
}: {
  title: string;
  count: number;
  entries: readonly DisplayVote[];
  profiles: ReadonlyMap<string, string>;
}) {
  return (
    <div className="rounded-lg bg-mirai-surface p-4">
      <h3 className="font-bold text-mirai-text">
        {title} <span className="text-sm font-normal">{count}人</span>
      </h3>
      {entries.length === 0 ? (
        <p className="mt-2 text-sm text-mirai-text-secondary">該当なし</p>
      ) : (
        <ul className="mt-2 space-y-2 text-sm leading-relaxed">
          {entries.map((entry, index) => (
            <li
              key={
                entry.kind === "faction"
                  ? entry.faction
                  : `${entry.vote.politicianId ?? entry.vote.name}-${index}`
              }
            >
              {entry.kind === "faction" ? (
                <>
                  <Link
                    className="text-mirai-text underline decoration-primary-accent underline-offset-2"
                    href="/politicians#councillors-directory-heading"
                    aria-label={`${entry.faction}を含む現在の議員一覧`}
                  >
                    {entry.faction}
                  </Link>
                  <span className="text-mirai-text-secondary">
                    （投票者{entry.count}人）
                  </span>
                </>
              ) : (
                <PersonName vote={entry.vote} profiles={profiles} />
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function BillVoteSection({
  snapshot,
  profiles,
}: {
  snapshot: BillVoteSnapshot;
  profiles: ReadonlyMap<string, string>;
}) {
  const summary = groupBillVotes(snapshot.votes);

  return (
    <section
      aria-labelledby="bill-vote-heading"
      className="space-y-4 rounded-xl border border-mirai-border bg-white p-6"
    >
      <h2 id="bill-vote-heading" className="text-xl font-bold text-mirai-text">
        本会議での賛否
      </h2>
      <div className="space-y-1 text-sm leading-relaxed text-mirai-text">
        <p>
          対象の議案：<strong>{snapshot.targetTitle}</strong>（
          {snapshot.billNumber}）
        </p>
        <p>{snapshot.meeting}の議決結果です。</p>
        {snapshot.scopeNote && (
          <p className="font-semibold">{snapshot.scopeNote}</p>
        )}
      </div>
      <p className="text-sm leading-relaxed text-mirai-text-secondary">
        同じ会派で投票した議員の賛否が一致した場合は会派名で表示しています。
        人数は投票した議員の数です。会派名は採決時点のもので、リンク先には現在の所属が表示されます。
      </p>
      <div className="grid gap-3 md:grid-cols-2">
        <VoteList
          title="賛成"
          count={summary.forCount}
          entries={summary.entries.for}
          profiles={profiles}
        />
        <VoteList
          title="反対"
          count={summary.againstCount}
          entries={summary.entries.against}
          profiles={profiles}
        />
      </div>
      {summary.unvoted.length > 0 && (
        <div className="space-y-2 text-sm leading-relaxed">
          <h3 className="font-bold text-mirai-text">
            採決に加わらなかった議員
          </h3>
          <ul className="space-y-1">
            {summary.unvoted.map((vote, index) => (
              <li key={`${vote.politicianId ?? vote.name}-${index}`}>
                <PersonName vote={vote} profiles={profiles} />
                <span>：{RESULT_LABELS[vote.result]}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      <p className="text-sm text-mirai-text-secondary">
        出典：
        <a
          href={`${snapshot.sourceUrl}#page=${snapshot.sourcePage}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-mirai-text underline decoration-primary-accent underline-offset-2"
        >
          大分市議会の議決結果（PDF・{snapshot.sourcePage}ページ）
          <ExternalLink aria-hidden="true" className="size-3.5" />
        </a>
      </p>
    </section>
  );
}
