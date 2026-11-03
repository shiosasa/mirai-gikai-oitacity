import "server-only";
import { requireAdmin } from "@/features/auth/server/lib/auth-server";
import { InformationManager } from "../../client/components/information-manager";
import { findInformationForAdmin } from "../repositories/information-repository";

export async function InformationAdminView() {
  await requireAdmin();
  if (process.env.SITE_INFORMATION_ENABLED !== "true") {
    return (
      <p>
        お知らせ管理が無効です。必要なDB項目を確認し、管理画面の環境変数に
        SITE_INFORMATION_ENABLED=true を設定して再デプロイしてください。
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
