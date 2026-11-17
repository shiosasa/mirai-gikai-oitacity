import "server-only";
import { PoliticianManagerClient } from "../../client/components/politician-manager-client";
import { loadPoliticiansForAdmin } from "../loaders/load-politicians";

export async function PoliticiansAdminView() {
  const { politicians } = await loadPoliticiansForAdmin();
  return (
    <div className="container mx-auto space-y-6 py-8">
      <header>
        <h1 className="text-2xl font-bold">議員紹介の管理</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          大分市の公開ページと同じ項目を編集します。議員本人の識別子と議会での発言の紐づけは変更しません。
        </p>
      </header>
      <PoliticianManagerClient politicians={politicians} />
    </div>
  );
}
