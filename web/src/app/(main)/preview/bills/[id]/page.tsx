import { BillPickupPreviewView } from "@/features/committee-minutes/server/components/bill-pickup-preview-view";

interface PreviewBillPageProps {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    token?: string;
  }>;
}

export default async function PreviewBillPage({
  params,
  searchParams,
}: PreviewBillPageProps) {
  const { id } = await params;
  const { token } = await searchParams;

  return <BillPickupPreviewView id={id} token={token} />;
}
