import "server-only";
import { unstable_cache } from "next/cache";
import {
  findPoliticianDiscussions,
  findPublishedPoliticianById,
} from "../repositories/politician-repository";

export const getPublishedPolitician = unstable_cache(
  findPublishedPoliticianById,
  ["published-politician"],
  { revalidate: 3600 }
);

export const getPoliticianDiscussions = unstable_cache(
  findPoliticianDiscussions,
  ["politician-discussions"],
  { revalidate: 600 }
);
