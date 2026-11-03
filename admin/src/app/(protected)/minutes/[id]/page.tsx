import { MinutesDetail } from "@/features/minutes/server/components/minutes-pages";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return <MinutesDetail id={(await params).id} />;
}
