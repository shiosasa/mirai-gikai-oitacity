import { PoliticiansDirectory } from "@/features/politicians/server/components/politicians-directory";

export const metadata = {
  title: "議員紹介 | みらいぎかいっち＠大分",
  description: "大分市議会の所属議員一覧・所属会派・委員会情報です。",
};

export default function PoliticiansPage() {
  return <PoliticiansDirectory />;
}
