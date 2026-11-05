import "server-only";
import { unstable_cache } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { findCurrentMayor } from "../repositories/mayor-repository";

export const getCurrentMayor = unstable_cache(
  findCurrentMayor,
  ["current-mayor-profile"],
  { revalidate: 3600, tags: [CACHE_TAGS.POLITICIANS] }
);
