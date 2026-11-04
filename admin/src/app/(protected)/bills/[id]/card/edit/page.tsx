import { BillCardEditView } from "@/features/bills-edit/server/components/bill-card-edit-view";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <BillCardEditView id={id} />;
}
