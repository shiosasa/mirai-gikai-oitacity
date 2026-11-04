import { Container } from "@/components/layouts/container";
import { BillPickupDetailView } from "@/features/committee-minutes/server/components/bill-pickup-detail-view";

export const metadata = { title: "議案詳細 | 大分市議会" };

export default async function BillPickupDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ topic?: string | string[] }>;
}) {
  const { id } = await params;
  const { topic } = await searchParams;
  return (
    <Container className="py-8">
      <BillPickupDetailView id={id} topicId={topic} />
    </Container>
  );
}
