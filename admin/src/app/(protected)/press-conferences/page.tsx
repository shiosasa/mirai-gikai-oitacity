import type { ListSearchParams } from "@/features/content-management/shared/utils/content-input";
import { ConferenceList } from "@/features/press-conferences/server/components/conference-pages";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<ListSearchParams>;
}) {
  return <ConferenceList search={await searchParams} />;
}
