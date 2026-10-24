import { Container } from "@/components/layouts/container";
import { BillPickupDetailView } from "@/features/committee-minutes/server/components/bill-pickup-detail-view";

export const metadata = { title: "議案詳細 | 大分市議会" };

export default async function BillPickupDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <Container className="py-8">
      <BillPickupDetailView id={id} />
    </Container>
  );
}
