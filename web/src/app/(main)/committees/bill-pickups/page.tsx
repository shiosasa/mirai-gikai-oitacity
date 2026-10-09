import type { Metadata } from "next";
import { Container } from "@/components/layouts/container";
import { BillPickupsView } from "@/features/committee-minutes/server/components/bill-pickups-view";
import { getBillPickups } from "@/features/committee-minutes/server/loaders/get-bill-pickups";

export const metadata: Metadata = {
  title: "議案ピックアップ | 大分市議会",
};

export default async function BillPickupsPage() {
  const pickups = await getBillPickups();

  return (
    <Container className="py-8">
      <BillPickupsView pickups={pickups} />
    </Container>
  );
}
