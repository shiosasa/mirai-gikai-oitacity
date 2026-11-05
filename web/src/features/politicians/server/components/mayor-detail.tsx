import "server-only";
import { findMayorConferences } from "@/features/press-conferences/server/repositories/mayor-conference-repository";
import { MayorDetailContent } from "../../client/components/mayor-detail-content";
import { isMayorLocalPreviewEnabled } from "../../shared/utils/mayor-local-preview";
import { getCurrentMayor } from "../loaders/get-current-mayor";
import { findMayorProposals } from "../repositories/mayor-repository";

export async function MayorDetail() {
  const [mayor, proposals, conferences] = await Promise.all([
    getCurrentMayor(),
    findMayorProposals(),
    findMayorConferences(),
  ]);

  return (
    <MayorDetailContent
      mayor={mayor}
      proposals={proposals}
      conferences={conferences}
      localPreview={isMayorLocalPreviewEnabled(process.env)}
    />
  );
}
