import "server-only";
import { MessageCircle } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { DifficultySelector } from "@/features/bill-difficulty/client/components/difficulty-selector";
import { getDifficultyLevel } from "@/features/bill-difficulty/server/loaders/get-difficulty-level";
import { BillStatusProgress } from "@/features/bills/client/components/bill-detail/bill-status-progress";
import { BillContent } from "@/features/bills/server/components/bill-detail/bill-content";
import { getPublishedArticles } from "@/features/bills/server/loaders/get-articles";
import { getBillContentWithDifficulty } from "@/features/bills/server/loaders/helpers/get-bill-content";
import type { BillStatusEnum } from "@/features/bills/shared/types";
import { getPublishedPoliticians } from "@/features/politicians/server/loaders/get-published-politicians";
import { BillVoteSection } from "../../shared/components/bill-vote-section";
import { BILL_VOTE_SNAPSHOTS } from "../../shared/data/bill-vote-snapshots";
import { extractMarkdownSection } from "../../shared/utils/extract-markdown-section";
import { getBillTopicInterviews } from "../../shared/utils/get-bill-topic-interviews";
import { getBillPickups } from "../loaders/get-bill-pickups";
import { BillPickupsView } from "./bill-pickups-view";

const DETAIL_HEADING = "取り組みの詳細";

export async function BillPickupDetailView({ id }: { id: string }) {
  const items = await getBillPickups();
  const item = items.find((item) => item.billId === id);
  if (!item) notFound();
  const level = await getDifficultyLevel();
  const voteSnapshot = BILL_VOTE_SNAPSHOTS.find(
    (snapshot) => snapshot.billId === id
  );
  const [content, hardContent, articles, politicians] = await Promise.all([
    getBillContentWithDifficulty(id, "normal"),
    level === "hard"
      ? getBillContentWithDifficulty(id, "hard")
      : Promise.resolve(null),
    getPublishedArticles(),
    voteSnapshot ? getPublishedPoliticians() : Promise.resolve([]),
  ]);
  if (!content?.content) {
    throw new Error(`議案の詳細本文が見つかりません: ${id}`);
  }
  const interviews = getBillTopicInterviews(id, articles);
  const normalSection = extractMarkdownSection(content.content, DETAIL_HEADING);
  // 「詳しく」は難易度 hard の本文の同じ見出しを使う（無ければ準備中）
  const detailBody =
    level === "hard"
      ? hardContent?.difficulty_level === "hard"
        ? extractMarkdownSection(hardContent.content, DETAIL_HEADING).body
        : null
      : normalSection.body;
  const hasDetailSection = normalSection.rest !== content.content;

  return (
    <div className="space-y-6">
      <BillPickupsView items={[item]} detailMode />
      {item.status && (
        <section className="rounded-xl border border-mirai-border bg-white p-6">
          <BillStatusProgress status={item.status as BillStatusEnum} />
        </section>
      )}
      {voteSnapshot && (
        <BillVoteSection
          snapshot={voteSnapshot}
          profiles={
            new Map(
              politicians.map((politician) => [politician.id, politician.name])
            )
          }
        />
      )}
      <div className="space-y-4">
        <h2 className="text-[22px] font-bold">{DETAIL_HEADING}</h2>
        <section className="space-y-4 rounded-md bg-white px-4 py-8">
          <div className="flex justify-end">
            <DifficultySelector
              currentLevel={level}
              label="説明をもっと詳しく"
              labelStyle={{ fontSize: "16px" }}
              maintainScrollFromBottom
            />
          </div>
          {detailBody ? (
            <div className="[&_p:last-child]:mb-0">
              <BillContent
                bill={{ bill_content: { ...content, content: detailBody } }}
                markdownOptions={{ injectDifficultyCard: false }}
              />
            </div>
          ) : (
            <p className="text-mirai-text-secondary">
              詳しい説明は準備中です。
            </p>
          )}
        </section>
      </div>
      <BillContent
        bill={{ bill_content: { ...content, content: normalSection.rest } }}
        markdownOptions={{
          injectDifficultyCard: false,
          // 先頭の「取り組みの詳細」を外した分、元と同じ見出しの前に置く
          longPressTargetH2Index: hasDetailSection ? 2 : 3,
        }}
      />
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
