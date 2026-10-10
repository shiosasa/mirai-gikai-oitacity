import { Container } from "@/components/layouts/container";
import { BillPickupsView } from "@/features/committee-minutes/server/components/bill-pickups-view";
import { getBillPickups } from "@/features/committee-minutes/server/loaders/get-bill-pickups";

export const metadata = {
  title: "議案一覧 | 大分市議会",
};

export default async function BillPickupsPage() {
  const items = await getBillPickups();

  return (
    <Container className="py-8">
      <BillPickupsView items={items} />
    </Container>
  );
}
