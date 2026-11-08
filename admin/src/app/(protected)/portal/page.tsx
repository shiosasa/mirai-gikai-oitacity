import { Globe } from "lucide-react";
import { Suspense } from "react";
import { PortalManager } from "@/features/portal/client/components/portal-manager";
import {
  getPortalSites,
  getPortalSubmissions,
} from "@/features/portal/server/repositories/portal-repository";

export const metadata = {
  title: "全国リンク集管理 | みらい議会 管理画面",
};

export default async function PortalPage() {
  const [submissions, sites] = await Promise.all([
    getPortalSubmissions(),
    getPortalSites(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Globe className="w-7 h-7 text-emerald-600" />
            全国「地方版みらい議会」リンク集管理
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            ポータルサイト（となりの政治）に届いた掲載申請・変更連絡・リンク切れ報告の承認と、掲載中サイトの編集・管理を行えます。
          </p>
        </div>
        <a
          href="https://mirai-gikai-portal.vercel.app"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold px-3 py-2 rounded-lg flex items-center gap-1 border border-emerald-200"
        >
          公開ポータルを開く ↗
        </a>
      </div>

      <Suspense fallback={<div>読み込み中...</div>}>
        <PortalManager submissions={submissions} sites={sites} />
      </Suspense>
    </div>
  );
}
