import Link from "next/link";
import { Container } from "@/components/layouts/container";
import { ArticlesSection } from "@/features/bills/server/components/articles-section";
import { getPublishedArticles } from "@/features/bills/server/loaders/get-articles";
import { addTopicSourceBillDetailIds } from "@/features/bills/shared/utils/add-topic-source-bill-detail-ids";
import { getAllMeetingsAndCommittees } from "@/features/committee-minutes/server/loaders/get-all-meetings";
import { buildBillPickupItems } from "@/features/committee-minutes/shared/utils/build-bill-pickup-items";

export const metadata = {
  title: "トピックス | みらいぎかいっち＠大分",
};

export default async function TopicsPage() {
  const [articles, { plenaryMeetings, committeeMeetings }] = await Promise.all([
    getPublishedArticles(),
    getAllMeetingsAndCommittees(),
  ]);
  const billReferences = buildBillPickupItems([
    ...plenaryMeetings,
    ...committeeMeetings,
  ]).flatMap((item) =>
    item.references.map((reference) => ({
      sessionId: reference.sessionId,
      billNumber: reference.billNumber,
      billName: reference.billName,
      billId: item.billId,
    }))
  );
  const articlesWithBillLinks = addTopicSourceBillDetailIds(
    articles,
    billReferences
  );

  return (
    <Container className="py-8">
      <div className="mb-8">
        <Link
          href="/"
          className="text-sm text-primary-accent hover:text-primary font-medium mb-4 inline-block"
        >
          ← 戻る
        </Link>
      </div>

      {articlesWithBillLinks.length === 0 ? (
        <p className="text-sm text-mirai-text-muted text-center">
          記事はまだ掲載されていません。
        </p>
      ) : (
        <ArticlesSection articles={articlesWithBillLinks} />
      )}
    </Container>
  );
}
