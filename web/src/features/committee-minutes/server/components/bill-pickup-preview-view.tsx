import "server-only";
import { AlertTriangle } from "lucide-react";
import { notFound } from "next/navigation";
import { Container } from "@/components/layouts/container";
import { getDifficultyLevel } from "@/features/bill-difficulty/server/loaders/get-difficulty-level";
import { BillDetailLayout } from "@/features/bills/server/components/bill-detail/bill-detail-layout";
import { getBillByIdAdmin } from "@/features/bills/server/loaders/get-bill-by-id-admin";
import { validatePreviewToken } from "@/features/bills/server/loaders/validate-preview-token";
import { env } from "@/lib/env";
import { getBillPickups } from "../loaders/get-bill-pickups";
import { BillPickupDetailView } from "./bill-pickup-detail-view";

export async function BillPickupPreviewView({
  id,
  token,
}: {
  id: string;
  token?: string;
}) {
  if (!(await validatePreviewToken(id, token))) {
    notFound();
  }
  const item = (await getBillPickups(id)).find((item) => item.billId === id);
  const bill = item ? null : await getBillByIdAdmin(id);
  if (!item && !bill) notFound();
  const difficulty = bill ? await getDifficultyLevel() : null;

  return (
    <>
      <Container className="py-8">
        <aside className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-mirai-border bg-mirai-surface-grouped p-4 text-sm text-mirai-text">
          <p className="flex items-center gap-2">
            <AlertTriangle className="size-5 shrink-0" aria-hidden="true" />
            議案カードのプレビュー（この操作では公開されません）
          </p>
          <a
            href={`${env.adminUrl}/bills`}
            className="underline underline-offset-4"
          >
            管理画面に戻る
          </a>
        </aside>
      </Container>
      {item ? (
        <Container className="pb-8">
          <BillPickupDetailView id={id} previewItem={item} />
        </Container>
      ) : bill && difficulty ? (
        <BillDetailLayout bill={bill} currentDifficulty={difficulty} />
      ) : null}
    </>
  );
}
