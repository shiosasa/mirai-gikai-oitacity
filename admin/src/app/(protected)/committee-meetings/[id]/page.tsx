import { ArchiveDetail } from "@/features/committee-meetings/server/components/archive-pages";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return <ArchiveDetail id={(await params).id} />;
}
