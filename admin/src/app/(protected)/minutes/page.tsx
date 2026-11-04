import type { ListSearchParams } from "@/features/content-management/shared/utils/content-input";
import { MinutesList } from "@/features/minutes/server/components/minutes-pages";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<ListSearchParams>;
}) {
  return <MinutesList search={await searchParams} />;
}
