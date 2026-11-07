import {
  formatOfficeTerm,
  type OfficeTerm,
} from "@mirai-gikai/shared/politicians/office-history";
import { getHttpUrl } from "@/lib/utils/external-url";

export function OfficeTermList({ terms }: { terms: OfficeTerm[] }) {
  return (
    <section
      aria-label="在任履歴"
      className="my-6 rounded-lg border border-mirai-border bg-card p-5"
    >
      <h2 className="text-lg font-bold text-mirai-text">在任履歴</h2>
      <p className="mt-2 text-sm text-mirai-text-secondary">
        確認できた任期のみ掲載しています。未確認の日付や、過去の全任期を推測して補ってはいません。会派・委員会は記録時点の情報です。
      </p>
      <ul className="mt-3 space-y-3">
        {terms.map((term) => {
          const source = getHttpUrl(term.source_url);
          const endSource = getHttpUrl(term.ended_source_url);
          return (
            <li key={term.id} className="text-sm text-mirai-text">
              <p>{formatOfficeTerm(term)}</p>
              {term.role === "councillor" && (
                <p>
                  議席{term.seat_number ?? "未確認"}番・
                  {term.faction || "会派未確認"}
                  {term.standing_committee
                    ? `・${term.standing_committee}`
                    : ""}
                  {term.special_committee ? `・${term.special_committee}` : ""}
                </p>
              )}
              {source && (
                <a
                  href={source}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline"
                >
                  就任の公式出典
                </a>
              )}
              {endSource && (
                <a
                  href={endSource}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-3 text-primary underline"
                >
                  退任の公式出典
                </a>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
