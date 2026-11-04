import "server-only";
import { createAdminClient } from "@mirai-gikai/supabase";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { requireAdmin } from "@/features/auth/server/lib/auth-server";
import { EditField } from "@/features/content-management/client/components/edit-field";
import { SaveForm } from "@/features/content-management/client/components/save-form";
import { recordId } from "@/features/content-management/shared/utils/content-input";
import { BillContentsEditForm } from "../../client/components/bill-contents-edit-form";
import {
  cardReferenceFilter,
  findCardReferences,
} from "../../shared/utils/card-reference";
import { saveCardReference } from "../actions/save-card-reference";
import { getBillById } from "../loaders/get-bill-by-id";
import { getBillContents } from "../loaders/get-bill-contents";

export async function BillCardEditView({ id }: { id: string }) {
  await requireAdmin();
  const billId = recordId.parse(id);
  const [bill, contents, sessionsResult] = await Promise.all([
    getBillById(billId),
    getBillContents(billId),
    createAdminClient()
      .from("meeting_sessions")
      .select("id,session_title,date,bills")
      .contains("bills", cardReferenceFilter(billId))
      .order("date", { ascending: false }),
  ]);
  if (!bill) throw new Error("議案が見つかりません");
  if (sessionsResult.error)
    throw new Error(
      `カードの元データを取得できませんでした: ${sessionsResult.error.message}`
    );
  const references = sessionsResult.data.flatMap((session) =>
    findCardReferences(session.bills, billId).map((reference) => ({
      session,
      reference,
    }))
  );
  return (
    <div className="space-y-6">
      <Link href="/bills" className="text-primary underline">
        議案一覧へ戻る
      </Link>
      <h1 className="text-2xl font-bold">議案カード・詳細本文を編集</h1>
      <p>{bill.name}</p>
      <div className="flex flex-wrap gap-3">
        <Button asChild variant="outline">
          <Link href={`/bills/${id}/edit`}>審議状況・画像・カテゴリを編集</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href={`/bills/${id}/interview`}>インタビュー設定</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href={`/bills/${id}/reports`}>回答を確認</Link>
        </Button>
      </div>
      <p className="text-sm text-muted-foreground">
        公開サイトの議案カードは議事録に登録された議案名・番号・短い説明を表示します。
        詳細ページは下の「詳細本文」から編集できます。公開中のデータは保存で公開サイトに反映されます。
      </p>
      <section className="space-y-4">
        <h2 className="text-xl font-bold">公開カードの表示内容</h2>
        {references.length === 0 && (
          <p>
            この議案を参照する議事録がないため、議案ピックアップのカードには表示されません。
          </p>
        )}
        {references.map(({ session, reference }) => (
          <SaveForm
            key={`${session.id}-${reference.index}-${JSON.stringify(session.bills)}`}
            save={saveCardReference}
            confirmMessage="議事録のこの議案だけを更新します。公開カードと議事録に反映されます。原文と照合しましたか？"
            label="この議事録のカード表示を保存"
          >
            <h3 className="font-semibold">
              {session.date} {session.session_title}
            </h3>
            <input type="hidden" name="billId" value={billId} />
            <input type="hidden" name="sessionId" value={session.id} />
            <input type="hidden" name="index" value={reference.index} />
            <input
              type="hidden"
              name="expected_bills"
              value={JSON.stringify(session.bills)}
            />
            <EditField
              name="name"
              label="カードに表示する議案名"
              value={reference.name}
              required
            />
            <EditField
              name="number"
              label="議案番号"
              value={reference.number}
            />
            <EditField
              name="description"
              label="カードの短い説明"
              value={reference.description}
              multiline
              hint="同じ議案が複数の議事録にある場合、公開カードは最初に見つかった空欄でない説明を使います。各議事録の説明を確認してください。"
            />
          </SaveForm>
        ))}
      </section>
      <BillContentsEditForm bill={bill} billContents={contents} />
    </div>
  );
}
