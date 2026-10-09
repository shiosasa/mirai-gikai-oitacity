import { PoliticianManager } from "@/features/politicians/client/components/politician-manager";
import { loadPoliticiansForAdmin } from "@/features/politicians/server/loaders/load-politicians";

export default async function PoliticiansAdminPage() {
  const { politicians, factions } = await loadPoliticiansForAdmin();

  return (
    <div className="container mx-auto space-y-6 py-8">
      <header>
        <h1 className="text-2xl font-bold">議員名鑑管理</h1>
        <p className="mt-2 text-sm text-gray-600">
          公式資料を確認したプロフィールだけ公開してください。
        </p>
      </header>
      <PoliticianManager politicians={politicians} factions={factions} />
    </div>
  );
}
