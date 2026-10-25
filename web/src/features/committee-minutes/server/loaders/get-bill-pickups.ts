import "server-only";
import { getPublishedArticles } from "@/features/bills/server/loaders/get-articles";
import {
  findBillStatusByIds,
  findBillUpdatedAtByIds,
} from "@/features/bills/server/repositories/bill-repository";
import {
  addBillPickupCategories,
  addBillPickupStatuses,
  addBillPickupUpdatedAt,
  buildBillPickupItems,
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
  const [articles, dates, statuses] = await Promise.all([
    getPublishedArticles(),
    findBillUpdatedAtByIds(billIds),
    findBillStatusByIds(billIds),
  ]);
  return addBillPickupStatuses(
    addBillPickupUpdatedAt(addBillPickupCategories(items, articles), dates),
    statuses
  );
}
