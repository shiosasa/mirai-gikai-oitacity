import "server-only";
import { belongsToMayor } from "@mirai-gikai/shared/politicians/office-history";
import { notFound } from "next/navigation";
import { findMayorConferences } from "@/features/press-conferences/server/repositories/mayor-conference-repository";
import { MayorDetailContent } from "../../client/components/mayor-detail-content";
import { isMayorLocalPreviewEnabled } from "../../shared/utils/mayor-local-preview";
import { getCurrentMayor } from "../loaders/get-current-mayor";
import { findMayorProposals } from "../repositories/mayor-repository";
import {
  findHistoricalMayor,
  findOfficeTerms,
} from "../repositories/office-history-repository";

export async function MayorDetail({
  historicalId,
}: {
  historicalId?: string;
} = {}) {
  if (
    historicalId &&
    (!/^[1-9]\d*$/.test(historicalId) ||
      !Number.isSafeInteger(Number(historicalId)))
  )
    notFound();
  const [mayor, proposals, conferences, terms] = await Promise.all([
    historicalId
      ? findHistoricalMayor(Number(historicalId))
      : getCurrentMayor(),
    findMayorProposals(),
    findMayorConferences(),
    findOfficeTerms(),
  ]);
  const personTerms = terms.filter((term) => term.mayor_id === mayor?.id);
  if (historicalId && (!mayor || personTerms.length === 0)) notFound();
  const former =
    historicalId !== undefined &&
    !personTerms.some((term) => term.ended_on === null);

  return (
    <MayorDetailContent
      mayor={mayor}
      proposals={
        mayor
          ? proposals.filter((proposal) =>
              belongsToMayor(proposal.date, mayor.id, terms)
            )
          : []
      }
      conferences={
        mayor
          ? conferences.filter((conference) =>
              belongsToMayor(conference.held_at, mayor.id, terms)
            )
          : []
      }
      terms={personTerms}
      former={former}
      localPreview={isMayorLocalPreviewEnabled(process.env)}
    />
  );
}
