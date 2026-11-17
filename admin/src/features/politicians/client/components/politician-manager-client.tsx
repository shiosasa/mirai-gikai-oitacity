"use client";

import { useRouter } from "next/navigation";
import { savePolitician } from "../../server/actions/save-politician";
import type { PoliticianProfileRecord } from "../../shared/utils/politician-profile";
import { PoliticianManager } from "./politician-manager";

export function PoliticianManagerClient({
  politicians,
}: {
  politicians: PoliticianProfileRecord[];
}) {
  const router = useRouter();
  return (
    <PoliticianManager
      politicians={politicians}
      onSave={savePolitician}
      onRefresh={() => router.refresh()}
      scrollToForm={() => window.scrollTo({ top: 0, behavior: "smooth" })}
    />
  );
}
