import { MayorDetail } from "@/features/politicians/server/components/mayor-detail";
export const dynamic = "force-dynamic";
export default async function HistoricalMayorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <MayorDetail historicalId={id} />;
}
