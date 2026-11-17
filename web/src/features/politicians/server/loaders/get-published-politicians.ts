import "server-only";
import { unstable_cache } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache-tags";
import {
  findPublishedPoliticians,
  findRecordedPoliticians,
} from "../repositories/politician-repository";

export const getPublishedPoliticians = unstable_cache(
  findPublishedPoliticians,
  ["current-published-politicians"],
  { revalidate: 3600, tags: [CACHE_TAGS.POLITICIANS] }
);

export const getRecordedPoliticians = unstable_cache(
  findRecordedPoliticians,
  ["recorded-politicians"],
  { revalidate: 3600, tags: [CACHE_TAGS.POLITICIANS] }
);
