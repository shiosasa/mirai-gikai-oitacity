import { getCategoryLabel } from "@/features/bills/shared/utils/article-category";

export type BillPickupMeetingInput = {
  id: number;
  title: string;
  meetingType: string;
  sessions: {
    id: number;
    date?: string;
    bills?:
      | {
          number: string | null;
          name: string;
          description?: string | null;
          billId?: string | null;
        }[]
      | null;
  }[];
};

export type BillPickupReference = {
  meetingId: number;
  meetingTitle: string;
  meetingType: string;
  sessionId: number;
  date: string;
  billNumber: string | null;
  billName: string;
  description: string | null;
};

export type BillPickupItem = {
  billId: string;
  description: string | null;
  kind: BillPickupKind;
  updatedAt: string | null;
  categories: string[];
  relatedTopicTitles: string[];
  references: BillPickupReference[];
};

export type BillPickupKind = "予算" | "陳情" | "法案";

type PickupArticleReference = {
  session_id: number;
  bill_number: string | null;
  bill_name: string | null;
};

type PickupArticleCategory = {
  title: string;
  category: string | null;
  source_refs?: PickupArticleReference[] | null;
};

const BILL_PICKUP_CATEGORIES = new Set([
  "子育て・教育",
  "安心・安全・防災",
  "まちづくり・暮らし",
  "まちの仕組み・選挙",
]);

function normalizeReference(value: string): string {
  return value.normalize("NFKC").replace(/\s/g, "");
}

export function buildBillPickupItems(
  meetings: BillPickupMeetingInput[]
): BillPickupItem[] {
  const items = new Map<string, BillPickupItem>();

  for (const meeting of meetings) {
    for (const session of meeting.sessions) {
      for (const bill of session.bills ?? []) {
        if (!bill.billId) continue;

        let item = items.get(bill.billId);
        if (!item) {
          item = {
            billId: bill.billId,
            description: bill.description?.trim() || null,
            kind: getBillPickupKind(bill.number, bill.name),
            updatedAt: null,
            categories: [],
            relatedTopicTitles: [],
            references: [],
          };
          items.set(bill.billId, item);
        } else if (!item.description && bill.description?.trim()) {
          item.description = bill.description.trim();
        }

        const reference: BillPickupReference = {
          meetingId: meeting.id,
          meetingTitle: meeting.title,
          meetingType: meeting.meetingType,
          sessionId: session.id,
          date: session.date ?? "",
          billNumber: bill.number,
          billName: bill.name,
          description: bill.description?.trim() || null,
        };
        const isDuplicate = item.references.some(
          (existing) =>
            existing.meetingId === reference.meetingId &&
            existing.sessionId === reference.sessionId &&
            existing.billNumber === reference.billNumber &&
            existing.billName === reference.billName
        );
        if (!isDuplicate) item.references.push(reference);
      }
    }
  }

  return Array.from(items.values());
}

export function addBillPickupUpdatedAt(
  items: BillPickupItem[],
  updatedAtByBillId: Map<string, string>
): BillPickupItem[] {
  return items.map((item) => ({
    ...item,
    updatedAt: updatedAtByBillId.get(item.billId) ?? null,
  }));
}

export function addBillPickupCategories(
  items: BillPickupItem[],
  articles: PickupArticleCategory[]
): BillPickupItem[] {
  return items.map((item) => {
    const relatedArticles = articles.filter((article) =>
      (article.source_refs ?? []).some((sourceReference) =>
        item.references.some(
          (reference) =>
            reference.sessionId === sourceReference.session_id &&
            (reference.billNumber && sourceReference.bill_number
              ? normalizeReference(reference.billNumber) ===
                normalizeReference(sourceReference.bill_number)
              : sourceReference.bill_name !== null &&
                normalizeReference(reference.billName) ===
                  normalizeReference(sourceReference.bill_name))
        )
      )
    );

    return {
      ...item,
      categories: [
        ...new Set(
          relatedArticles
            .map((article) => getCategoryLabel(article.category))
            .filter((category) => BILL_PICKUP_CATEGORIES.has(category))
        ),
      ],
      relatedTopicTitles: [
        ...new Set(relatedArticles.map((article) => article.title)),
      ],
    };
  });
}

export function getBillPickupKind(
  billNumber: string | null,
  billName: string
): BillPickupKind {
  const billInfo = `${billNumber ?? ""}${billName}`.normalize("NFKC");
  if (billInfo.includes("請願") || billInfo.includes("陳情")) return "陳情";
  if (billInfo.includes("予算")) return "予算";
  return "法案";
}

export function getBillPickupHeading(
  billName: string,
  description: string | null,
  relatedTopicTitles: string[] = []
): string {
  if (!billName.includes("一般会計予算")) return billName;

  const fiscalYear = billName.match(/令和\d+年度/)?.[0];
  if (!fiscalYear) return billName;

  const context = `${description ?? ""} ${relatedTopicTitles.join(" ")}`;
  if (context.includes("イノシシ") || context.includes("有害鳥獣")) {
    return `${fiscalYear}予算（イノシシ被害対策）`;
  }

  const relatedProgram = relatedTopicTitles
    .map((title) => title.match(/【([^】]+)】/)?.[1])
    .find((program) => program);
  if (relatedProgram) return `${fiscalYear}予算（${relatedProgram}）`;

  if (description?.includes("市全体")) {
    return `大分市全体の${fiscalYear}予算`;
  }

  return billName;
}

export function formatBillPickupNumber(
  billNumber: string | null,
  date: string
): string | null {
  if (!billNumber) return null;
  const normalizedNumber = billNumber.normalize("NFKC");
  if (
    !normalizedNumber.startsWith("議第") ||
    /令和|平成/.test(normalizedNumber)
  ) {
    return billNumber;
  }

  const year = Number(date.slice(0, 4));
  if (!Number.isInteger(year) || year < 2019) return billNumber;
  return `令和${year - 2018}年 ${billNumber}`;
}

export function filterBillPickupItems(
  items: BillPickupItem[],
  category: string
): BillPickupItem[] {
  if (category === "すべて") return items;
  return items.filter((item) => item.categories.includes(category));
}
