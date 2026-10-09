import "server-only";
import { createAdminClient } from "@mirai-gikai/supabase";
import { unstable_cache } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache-tags";
import type { BillArticle, TopicSourceRef } from "../../shared/types";
import { categoryEnumFromBadge } from "../../shared/utils/article-category";
import { buildPublishedBillIdByName } from "../../shared/utils/build-published-bill-id-by-name";

/**
 * 公開済みの記事（bill_articles）を最新順に取得
 */
export async function getPublishedArticles(): Promise<BillArticle[]> {
  return _getCachedArticles();
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

const _getCachedArticles = unstable_cache(
  async (): Promise<BillArticle[]> => {
    const supabase = createAdminClient();

    // bill_articles は生成型に未反映のため any 経由でアクセスする
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const articlesTable = () => (supabase as any).from("bill_articles");

    const fetchArticles = (
      includePublishedAt: boolean,
      includeSourceRefs: boolean
    ) => {
      const optionalColumns = [
        includePublishedAt ? "published_at" : null,
        includeSourceRefs ? "source_refs" : null,
      ]
        .filter((column) => column !== null)
        .join(", ");
      const columns = optionalColumns
        ? `${ARTICLE_COLUMNS}, ${optionalColumns}`
        : ARTICLE_COLUMNS;

      return articlesTable()
        .select(columns)
        .order(includePublishedAt ? "published_at" : "created_at", {
          ascending: false,
          nullsFirst: false,
        });
    };

    let includePublishedAt = true;
    let includeSourceRefs = true;
    let { data, error } = await fetchArticles(
      includePublishedAt,
      includeSourceRefs
    );

    while (error) {
      if (includePublishedAt && error.message.includes("published_at")) {
        includePublishedAt = false;
      } else if (includeSourceRefs && error.message.includes("source_refs")) {
        includeSourceRefs = false;
      } else {
        break;
      }

      console.warn(
        "Retrying article query with legacy columns:",
        error.message
      );
      ({ data, error } = await fetchArticles(
        includePublishedAt,
        includeSourceRefs
      ));
    }

    if (error) {
      console.error("Failed to fetch articles:", error);
      return [];
    }

    // 記事タイトルと同名の議案（bills）に公開中のAIインタビューがあれば紐付ける
    const [
      { data: bills, error: billsError },
      { data: configs, error: configsError },
    ] = await Promise.all([
      supabase.from("bills").select("id, name, publish_status"),
      supabase
        .from("interview_configs")
        .select("bill_id")
        .eq("status", "public"),
    ]);
    if (billsError) {
      throw new Error(
        `Failed to fetch bills for article links: ${billsError.message}`
      );
    }
    if (configsError) {
      throw new Error(
        `Failed to fetch interview configs for article links: ${configsError.message}`
      );
    }
    const billIdByName = new Map(
      (bills ?? []).map((bill) => [bill.name, bill.id])
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
      const linkedBillId = billIdByName.get(article.title);
      return {
        ...article,
        published_at: article.published_at ?? null,
        source_refs: Array.isArray(article.source_refs)
          ? article.source_refs.map((ref: TopicSourceRef) => ({
              ...ref,
              detail_bill_id: ref.bill_name
                ? (publishedBillIdByName.get(ref.bill_name) ?? null)
                : null,
            }))
          : article.source_refs,
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

    return articles as BillArticle[];
  },
  ["published-articles"],
  {
    revalidate: 600, // 10分
    tags: [CACHE_TAGS.BILLS],
  }
);
