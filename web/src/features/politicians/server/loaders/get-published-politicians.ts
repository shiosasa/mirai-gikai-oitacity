import "server-only";
import { unstable_cache } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { findPublishedPoliticians } from "../repositories/politician-repository";

export const getPublishedPoliticians = unstable_cache(
  findPublishedPoliticians,
  ["published-politicians"],
  { revalidate: 3600, tags: [CACHE_TAGS.POLITICIANS] }
);
