import { PoliticiansDirectory } from "@/features/politicians/server/components/politicians-directory";

export const metadata = {
  title: "市長・議員紹介 | みらいぎかいっち＠大分市",
  description: "大分市長と市議会議員のプロフィールや所属会派を紹介します。",
};

export const dynamic = "force-dynamic";

export default function PoliticiansPage() {
  return <PoliticiansDirectory />;
}
