import type { BillTag } from "@/features/bills/shared/types";

export type BillPickupReference = {
  meetingId: number;
  meetingType: "本会議" | "委員会";
  meetingTitle: string;
  sessionId: number;
  sessionTitle: string;
  meetingDate: string;
};

export type BillPickupSource = BillPickupReference & {
  billId: string | null;
  billNumber: string | null;
};

export type PublishedBillPickupData = {
  id: string;
  name: string;
  bill_number: string | null;
  tags: BillTag[];
};

export type BillPickup = PublishedBillPickupData & {
  references: BillPickupReference[];
};
