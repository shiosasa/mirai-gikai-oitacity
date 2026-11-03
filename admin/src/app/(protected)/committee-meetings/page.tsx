import { ArchiveList } from "@/features/committee-meetings/server/components/archive-pages";
import type { ListSearchParams } from "@/features/content-management/shared/utils/content-input";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<ListSearchParams>;
}) {
  return <ArchiveList search={await searchParams} />;
}
