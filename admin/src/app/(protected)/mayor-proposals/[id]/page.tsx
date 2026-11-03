import { ProposalDetail } from "@/features/minutes/server/components/proposal-pages";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return <ProposalDetail id={(await params).id} />;
}
