import "server-only";
import {
  findPublishedBillsByIds,
  findTagsByBillIds,
} from "@/features/bills/server/repositories/bill-repository";
import type { BillPickupSource } from "../../shared/types/bill-pickup";
import { buildBillPickupItems } from "../../shared/utils/build-bill-pickup-items";
import { getAllMeetingsAndCommittees } from "./get-all-meetings";

export async function getBillPickups() {
  const { plenaryMeetings, committeeMeetings } =
    await getAllMeetingsAndCommittees();
  const meetings = [...plenaryMeetings, ...committeeMeetings];
  const sources: BillPickupSource[] = meetings.flatMap((meeting) =>
    meeting.sessions.flatMap((session) =>
      (session.bills ?? []).map((bill) => ({
        billId: bill.detail_bill_id ?? null,
        billNumber: bill.number,
        meetingId: meeting.id,
        meetingType: meeting.meetingType,
        meetingTitle: meeting.title,
        sessionId: session.id,
        sessionTitle: session.session_title ?? meeting.title,
        meetingDate: session.date ?? meeting.date,
      }))
    )
  );
  const billIds = [
    ...new Set(sources.flatMap((source) => source.billId ?? [])),
  ];
  const [publishedBills, tagsByBillId] = await Promise.all([
    findPublishedBillsByIds(billIds),
    findTagsByBillIds(billIds),
  ]);
  const publishedBillsWithTags = publishedBills.map((bill) => ({
    ...bill,
    tags: tagsByBillId.get(bill.id) ?? [],
  }));

  return buildBillPickupItems(sources, publishedBillsWithTags);
}
