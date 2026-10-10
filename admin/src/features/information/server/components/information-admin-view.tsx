import "server-only";
import { requireAdmin } from "@/features/auth/server/lib/auth-server";
import { InformationManager } from "../../client/components/information-manager";
import { findInformationForAdmin } from "../repositories/information-repository";

export async function InformationAdminView() {
  await requireAdmin();
  if (process.env.SITE_INFORMATION_ENABLED !== "true") {
    return (
      <p>
        お知らせ管理は準備中です。承認後にDB変更と環境変数の設定が必要です。
      </p>
    );
  }
  const entries = await findInformationForAdmin();
  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-bold">information管理</h1>
      <InformationManager entries={entries} />
    </section>
  );
}
