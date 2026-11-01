import "server-only";
import { getPublishedArticles } from "@/features/bills/server/loaders/get-articles";
import {
  findBillStatusByIds,
  findBillUpdatedAtByIds,
  findTagsByBillIds,
} from "@/features/bills/server/repositories/bill-repository";
import {
  addBillPickupCategories,
  addBillPickupStatuses,
  addBillPickupTagCategories,
  addBillPickupUpdatedAt,
  buildBillPickupItems,
  sortBillPickupItemsByUpdatedAt,
} from "../../shared/utils/build-bill-pickup-items";
import { getAllMeetingsAndCommittees } from "./get-all-meetings";

export async function getBillPickups() {
  const { plenaryMeetings, committeeMeetings } =
    await getAllMeetingsAndCommittees();
  const items = buildBillPickupItems([
    ...plenaryMeetings,
    ...committeeMeetings,
  ]);
  const billIds = items.map((item) => item.billId);
  const [articles, dates, statuses, tagsByBillId] = await Promise.all([
    getPublishedArticles(),
    findBillUpdatedAtByIds(billIds),
    findBillStatusByIds(billIds),
    findTagsByBillIds(billIds),
  ]);
  const tagLabelsByBillId = new Map<string, string[]>();
  for (const [billId, tags] of tagsByBillId) {
    tagLabelsByBillId.set(
      billId,
      tags.map((tag) => tag.label)
    );
  }
  return sortBillPickupItemsByUpdatedAt(
    addBillPickupStatuses(
      addBillPickupUpdatedAt(
        addBillPickupTagCategories(
          addBillPickupCategories(items, articles),
          tagLabelsByBillId
        ),
        dates
      ),
      statuses
    )
  );
}
