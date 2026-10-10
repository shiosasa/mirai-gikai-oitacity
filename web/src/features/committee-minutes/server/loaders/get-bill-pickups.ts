import "server-only";
import { getPublishedArticles } from "@/features/bills/server/loaders/get-articles";
import { findBillUpdatedAtByIds } from "@/features/bills/server/repositories/bill-repository";
import {
  addBillPickupCategories,
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
  const [articles, dates] = await Promise.all([
    getPublishedArticles(),
    findBillUpdatedAtByIds(items.map((item) => item.billId)),
  ]);
  return addBillPickupUpdatedAt(
    addBillPickupCategories(items, articles),
    dates
  );
}
