import { PoliticianDirectoryCard } from "../../client/components/politician-directory-card";
import type { Politician } from "../types/politician";
import { getFactionDirectorySectionId } from "../utils/faction-directory-links";
import type { FactionGroup } from "../utils/group-politicians-by-faction";

export function PoliticiansFactionSection({
  group,
}: {
  group: FactionGroup<Politician>;
}) {
  const headingId = getFactionDirectorySectionId(group.displayName);

  return (
    <section aria-labelledby={headingId}>
      <div className="mb-4 flex items-baseline gap-3 border-l-4 border-oita-pink pl-3">
        <h3
          id={headingId}
          className="scroll-mt-24 text-lg font-bold text-mirai-text"
        >
          {group.displayName}
        </h3>
        <p className="text-xs text-mirai-text-muted">
          {group.politicians.length}名
        </p>
      </div>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {group.politicians.map((politician) => (
          <li key={politician.id}>
            <PoliticianDirectoryCard politician={politician} />
          </li>
        ))}
      </ul>
    </section>
  );
}
