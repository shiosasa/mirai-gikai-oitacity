import { PoliticianProfile } from "@/features/politicians/server/components/politician-profile";

interface PoliticianDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function PoliticianDetailPage({
  params,
}: PoliticianDetailPageProps) {
  const { id } = await params;
  return <PoliticianProfile id={id} />;
}
