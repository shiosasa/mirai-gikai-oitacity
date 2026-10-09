"server-only";

import { getPoliticianByIdRepository } from "../repositories/politician-repository";
import type { PoliticianRow } from "../repositories/politician-repository";

export async function getPoliticianDetail(
  id: string
): Promise<PoliticianRow | null> {
  return await getPoliticianByIdRepository(id);
}
