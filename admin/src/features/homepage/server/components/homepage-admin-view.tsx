import "server-only";
import { requireAdmin } from "@/features/auth/server/lib/auth-server";
import { HomepageForm } from "../../client/components/homepage-form";
import { saveHomepage } from "../actions/save-homepage";
import { uploadHomepageImage } from "../actions/upload-homepage-image";
import { getHomepageForAdmin } from "../repositories/homepage-repository";

export async function HomepageAdminView() {
  await requireAdmin();
  const initial = await getHomepageForAdmin();
  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">トップページ編集</h1>
      <p>
        文章・画像・リンクを編集し、プレビューを確認してから保存します。保存すると公開サイトの更新対象になります。AIトークンは使用しません。
      </p>
      <p className="text-sm text-muted-foreground">
        会期・議案・トピックス・お知らせは従来の画面で管理します。各欄の表示条件・配置、免責事項・運営ポリシーは変更しません。
      </p>
      <HomepageForm
        initial={initial}
        onSave={saveHomepage}
        onUpload={uploadHomepageImage}
      />
    </div>
  );
}
