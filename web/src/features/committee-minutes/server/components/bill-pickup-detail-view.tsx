import "server-only";
import { MessageCircle } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { BillContent } from "@/features/bills/server/components/bill-detail/bill-content";
import { getPublishedArticles } from "@/features/bills/server/loaders/get-articles";
import { getBillContentWithDifficulty } from "@/features/bills/server/loaders/helpers/get-bill-content";
import { getBillTopicInterviews } from "../../shared/utils/get-bill-topic-interviews";
import { getBillPickups } from "../loaders/get-bill-pickups";
import { BillPickupsView } from "./bill-pickups-view";

export async function BillPickupDetailView({ id }: { id: string }) {
  const items = await getBillPickups();
  const item = items.find((item) => item.billId === id);
  if (!item) notFound();
  const [content, articles] = await Promise.all([
    getBillContentWithDifficulty(id, "normal"),
    getPublishedArticles(),
  ]);
  if (!content?.content) {
    throw new Error(`議案の詳細本文が見つかりません: ${id}`);
  }
  const interviews = getBillTopicInterviews(id, articles);

  return (
    <div className="space-y-6">
      <BillPickupsView items={[item]} detailMode />
      <BillContent bill={{ bill_content: content }} />
      {interviews.length > 0 && (
        <section className="space-y-4 rounded-xl border border-mirai-border bg-white p-6">
          <h2 className="text-xl font-bold text-mirai-text">
            AIインタビューで意見を伝える
          </h2>
          <p className="text-sm text-mirai-text-secondary">
            この議案に関連するトピックスについて、あなたの考えを話してみませんか。
          </p>
          <ul className="space-y-4">
            {interviews.map((interview) => (
              <li key={interview.billId} className="space-y-2">
                <p className="text-sm text-mirai-text">{interview.title}</p>
                <Button asChild variant="outline">
                  <Link href={`/bills/${interview.billId}/interview`}>
                    <MessageCircle aria-hidden="true" />
                    AIインタビューへ進む
                  </Link>
                </Button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
