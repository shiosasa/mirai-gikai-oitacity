import { MayorDetail } from "@/features/politicians/server/components/mayor-detail";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "市長紹介 | みらいぎかいっち＠大分市",
  description:
    "大分市長のプロフィール、議会への提案理由、記者会見を紹介します。",
};

export default function MayorPage() {
  return <MayorDetail />;
}
