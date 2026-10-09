"use client";

import { PoliticianCard } from "./politician-card";
import type { Politician } from "@/features/politicians/shared/types/politician";

interface PoliticianListProps {
  politicians: Politician[];
}

export function PoliticianList({ politicians }: PoliticianListProps) {
  if (politicians.length === 0) {
    return (
      <div className="text-center py-12 text-mirai-text-muted">
        登録されている議員データがありません。
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {politicians.map((politician) => (
        <PoliticianCard key={politician.id} politician={politician} />
      ))}
    </div>
  );
}
