import "server-only";
import { createAdminClient } from "@mirai-gikai/supabase";
import { unstable_cache, unstable_noStore } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache-tags";
import type { BillArticle } from "../../shared/types";
import { categoryEnumFromBadge } from "../../shared/utils/article-category";
import { buildPublishedBillIdByName } from "../../shared/utils/build-published-bill-id-by-name";
import { resolveTopicBillDetailId } from "../../shared/utils/resolve-topic-bill-detail-id";
import { sortTopicsByPublicationDate } from "../../shared/utils/sort-topics-by-publication-date";

/**
 * 公開済みの記事（bill_articles）を最新順に取得
 */
export async function getPublishedArticles(): Promise<BillArticle[]> {
  if (process.env.TOPIC_PUBLICATION_ENABLED === "true") {
    unstable_noStore();
    return loadArticles(true);
  }
  return _getCachedArticles(false);
}

const ARTICLE_COLUMNS = `
        id,
        bill_id,
        title,
        status_label,
        status_class,
        category,
        summary_line_1,
        summary_line_2,
        summary_line_3,
        details,
        reason,
        point_1,
        point_2,
        point_3,
        target_audience,
        positive_voice,
        cautious_voice,
        link_label,
        link_url,
        decision_date,
        created_at,
        updated_at,
        proposal_id,
        proposals(
          published_date,
          status,
          statusClass,
          badge,
          summary1,
          summary2,
          summary3,
          gikaiDetail,
          reason,
          point1,
          point2,
          point3,
          impact,
          pro,
          con
        )
      `;

async function loadArticles(
  publicationEnabled: boolean
): Promise<BillArticle[]> {
  const supabase = createAdminClient();

  // bill_articles は生成型に未反映のため any 経由でアクセスする
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const articlesTable = () => (supabase as any).from("bill_articles");

  const fetchArticles = (withReferences: boolean) => {
    let query = articlesTable().select(
      `${ARTICLE_COLUMNS}${withReferences ? ", source_refs" : ""}${publicationEnabled ? ", publish_status, first_published_at" : ""}`
    );
    if (publicationEnabled) query = query.eq("publish_status", "published");
    return query.order("created_at", { ascending: false });
  };
  let { data, error } = await fetchArticles(true);

  if (error) {
    // source_refs 列が未適用の環境向けフォールバック
    console.warn("Falling back without source_refs:", error.message);
    ({ data, error } = await fetchArticles(false));
  }

  if (error) {
    console.error("Failed to fetch articles:", error);
    throw new Error(`Failed to fetch articles: ${error.message}`);
  }

  // 記事タイトルと同名の議案（bills）に公開中のAIインタビューがあれば紐付ける
  const [
    { data: bills, error: billsError },
    { data: configs, error: configsError },
  ] = await Promise.all([
    supabase.from("bills").select("id, name, bill_number, publish_status"),
    supabase.from("interview_configs").select("bill_id").eq("status", "public"),
  ]);
  if (billsError) {
    throw new Error(
      `Failed to fetch published bills for articles: ${billsError.message}`
    );
  }
  if (configsError) {
    throw new Error(
      `Failed to fetch public interview configs: ${configsError.message}`
    );
  }
  const billByName = new Map(
    (bills ?? []).map((bill) => [
      bill.name,
      { id: bill.id, number: bill.bill_number },
    ])
  );
  const publishedBillIdByName = buildPublishedBillIdByName(bills ?? []);
  const billsWithInterview = new Set(
    (configs ?? []).map((config) => config.bill_id)
  );

  console.log(
    "[DEBUG] Raw proposals data:",
    JSON.stringify(data?.[0]?.proposals, null, 2)
  );

  // proposals のカラムを bill_articles のカラムにマッピング
  const articles = (data ?? []).map((article: any) => {
    const linkedBill = billByName.get(article.title);
    const linkedBillId = linkedBill?.id;
    const sourceRefs = Array.isArray(article.source_refs)
      ? article.source_refs.map(
          (reference: {
            session_id: number;
            session_label: string;
            date: string;
            bill_number: string | null;
            bill_name: string | null;
          }) => ({
            ...reference,
            detail_bill_id: resolveTopicBillDetailId(
              reference.bill_name,
              article.title,
              linkedBillId ?? null,
              publishedBillIdByName
            ),
          })
        )
      : [];
    return {
      ...article,
      published_date: article.proposals?.published_date ?? null,
      publish_status: publicationEnabled ? article.publish_status : "published",
      first_published_at: publicationEnabled
        ? article.first_published_at
        : null,
      related_bill_id: linkedBillId ?? null,
      source_refs: sourceRefs,
      interview_bill_id:
        linkedBillId && billsWithInterview.has(linkedBillId)
          ? linkedBillId
          : null,
      category: article.proposals?.badge
        ? categoryEnumFromBadge(article.proposals.badge)
        : article.category,
      status_label: article.proposals?.status || article.status_label,
      status_class: article.proposals?.statusClass || article.status_class,
      summary_line_1: article.proposals?.summary1 || article.summary_line_1,
      summary_line_2: article.proposals?.summary2 || article.summary_line_2,
      summary_line_3: article.proposals?.summary3 || article.summary_line_3,
      details: article.proposals?.gikaiDetail || article.details,
      reason: article.proposals?.reason || article.reason,
      point_1: article.proposals?.point1 || article.point_1,
      point_2: article.proposals?.point2 || article.point_2,
      point_3: article.proposals?.point3 || article.point_3,
      target_audience: article.proposals?.impact || article.target_audience,
      positive_voice: article.proposals?.pro || article.positive_voice,
      cautious_voice: article.proposals?.con || article.cautious_voice,
    };
  });

  console.log("[DEBUG] Articles fetched:", articles.length);
  if (articles.length > 0) {
    console.log(
      "[DEBUG] First article summary_line_1:",
      articles[0].summary_line_1
    );
    console.log("[DEBUG] First article details:", articles[0].details);
    console.log("[DEBUG] First article point_1:", articles[0].point_1);
  }

  return sortTopicsByPublicationDate(articles) as BillArticle[];
}

const _getCachedArticles = unstable_cache(
  loadArticles,
  ["published-articles-by-proposal-published-date-v5"],
  {
    revalidate: 600, // 10分
    tags: [CACHE_TAGS.BILLS],
  }
);
