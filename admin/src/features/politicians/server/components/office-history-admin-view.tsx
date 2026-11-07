import "server-only";
import { requireAdmin } from "@/features/auth/server/lib/auth-server";
import { OfficeHistoryManagerClient } from "../../client/components/office-history-manager-client";
import { loadOfficeHistory } from "../repositories/office-history-repository";
export async function OfficeHistoryAdminView() {
  await requireAdmin();
  const data = await loadOfficeHistory();
  return (
    <div className="mx-auto max-w-4xl space-y-6 py-8">
      <h1 className="text-2xl font-bold">市長・議員の交代と任期履歴</h1>
      <p>
        人物情報を上書きして別人にしないでください。退任・後任への交代・再選・再就任を記録し、以前の人物と活動を残します。交代は一つの処理で保存され、途中失敗時は変更されません。
      </p>
      <p className="text-sm text-muted-foreground">
        導入前の議員の就任日は未確認です。過去の任期を推測して追加しません。会派・委員会は任期開始・終了時点の記録で、任期途中の全異動履歴を表すものではありません。
      </p>
      <OfficeHistoryManagerClient {...data} />
    </div>
  );
}
