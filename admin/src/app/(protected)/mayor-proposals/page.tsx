import type { ListSearchParams } from "@/features/content-management/shared/utils/content-input";
import { ProposalList } from "@/features/minutes/server/components/proposal-pages";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<ListSearchParams>;
}) {
  return <ProposalList search={await searchParams} />;
}
