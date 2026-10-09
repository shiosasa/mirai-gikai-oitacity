import Link from "next/link";
import { getPublishedPoliticians } from "@/features/politicians/server/loaders/get-published-politicians";
import type {
  SessionAttendees,
  SessionBill,
} from "../repositories/meeting-repository";

function resultClassName(result: string): string {
  // 「不採択」が「採択」にマッチしないよう、否定系を先に判定する
  if (/否決|不採択/.test(result)) return "bg-red-100 text-red-800";
  if (/可決|承認|採択|同意/.test(result)) return "bg-green-100 text-green-800";
  if (/継続/.test(result)) return "bg-amber-100 text-amber-800";
  return "bg-gray-100 text-gray-700";
}

function PoliticianChip({
  name,
  href,
  muted = false,
}: {
  name: string;
  href: string | null;
  muted?: boolean;
}) {
  const className = `px-2 py-0.5 rounded border text-sm ${
    muted ? "text-mirai-text-muted" : "text-mirai-text-secondary"
  } ${
    href
      ? "bg-white border-primary/30 hover:border-primary hover:text-primary transition-colors"
      : "bg-gray-50 border-mirai-border"
  }`;

  return href ? (
    <Link href={href} className={className}>
      {name}
    </Link>
  ) : (
    <span className={className}>{name}</span>
  );
}

export async function AttendeesSection({
  attendees,
  meetingType,
}: {
  attendees: SessionAttendees;
  meetingType: "本会議" | "委員会";
}) {
  const politicians = await getPublishedPoliticians();
  const hrefByName = new Map(
    politicians.map((p) => [p.name, `/politicians/${p.id}`])
  );
  const hrefOf = (name: string) => hrefByName.get(name) ?? null;

  const chairLabel = meetingType === "委員会" ? "委員長" : "議長";
  const viceChairLabel = meetingType === "委員会" ? "副委員長" : "副議長";
  const membersLabel = meetingType === "委員会" ? "委員" : "出席議員";

  return (
    <section className="bg-white rounded-lg p-6 border border-mirai-border">
      <h2 className="text-lg font-bold text-mirai-text mb-3">👥 出席議員</h2>
      <div className="space-y-4">
        {(attendees.chair || attendees.vice_chair) && (
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
            {attendees.chair && (
              <div className="flex items-center gap-2">
                <span className="text-mirai-text-muted">{chairLabel}</span>
                <PoliticianChip
                  name={attendees.chair}
                  href={hrefOf(attendees.chair)}
                />
              </div>
            )}
            {attendees.vice_chair && (
              <div className="flex items-center gap-2">
                <span className="text-mirai-text-muted">{viceChairLabel}</span>
                <PoliticianChip
                  name={attendees.vice_chair}
                  href={hrefOf(attendees.vice_chair)}
                />
              </div>
            )}
          </div>
        )}

        {attendees.members.length > 0 && (
          <div>
            <p className="text-sm text-mirai-text-muted mb-2">
              {membersLabel}（{attendees.members.length}名）
            </p>
            <div className="flex flex-wrap gap-1.5">
              {attendees.members.map((name) => (
                <PoliticianChip key={name} name={name} href={hrefOf(name)} />
              ))}
            </div>
          </div>
        )}

        {attendees.absent.length > 0 && (
          <div>
            <p className="text-sm text-mirai-text-muted mb-2">
              欠席（{attendees.absent.length}名）
            </p>
            <div className="flex flex-wrap gap-1.5">
              {attendees.absent.map((name) => (
                <PoliticianChip
                  key={name}
                  name={name}
                  href={hrefOf(name)}
                  muted
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export function BillsSection({ bills }: { bills: SessionBill[] }) {
  return (
    <section className="bg-white rounded-lg p-6 border border-mirai-border">
      <h2 className="text-lg font-bold text-mirai-text mb-3">
        📑 審議された議案（{bills.length}件）
      </h2>
      <ul className="divide-y divide-mirai-border">
        {bills.map((bill, i) => (
          <li key={`${bill.number ?? bill.name}-${i}`} className="py-3">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              {bill.number && (
                <span className="px-2 py-0.5 rounded bg-primary/10 text-primary text-xs font-medium">
                  {bill.number}
                </span>
              )}
              <span className="font-medium text-mirai-text">{bill.name}</span>
              {bill.result && (
                <span
                  className={`px-2 py-0.5 rounded text-xs font-medium ${resultClassName(bill.result)}`}
                >
                  {bill.result}
                </span>
              )}
            </div>
            {bill.description && (
              <p className="text-sm text-mirai-text-secondary leading-relaxed">
                {bill.description}
              </p>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
