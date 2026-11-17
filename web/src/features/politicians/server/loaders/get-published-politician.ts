import "server-only";
import { unstable_cache } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache-tags";
import {
  findPoliticianDiscussions,
  findPublishedPoliticianById,
} from "../repositories/politician-repository";

export const getPublishedPolitician = unstable_cache(
  findPublishedPoliticianById,
  ["published-politician"],
  { revalidate: 3600, tags: [CACHE_TAGS.POLITICIANS] }
);

export const getPoliticianDiscussions = unstable_cache(
  findPoliticianDiscussions,
  ["politician-discussions"],
  { revalidate: 600 }
);
