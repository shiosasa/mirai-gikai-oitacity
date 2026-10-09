"server-only";

import { getPoliticiansRepository } from "../repositories/politician-repository";
import type { PoliticianRow } from "../repositories/politician-repository";

export async function getPoliticians(): Promise<PoliticianRow[]> {
  return await getPoliticiansRepository();
}
