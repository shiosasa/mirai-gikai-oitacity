import { describe, expect, it } from "vitest";
import { buildBillPickupItems } from "./build-bill-pickup-items";

describe("buildBillPickupItems", () => {
  it("groups linked published bills and skips missing or unpublished details", () => {
    const reference = {
      meetingId: 1,
      meetingType: "本会議" as const,
      meetingTitle: "本会議",
      sessionId: 10,
      sessionTitle: "令和8年第1回定例会",
      meetingDate: "2026-06-01",
    };

    expect(
      buildBillPickupItems(
        [
          {
            ...reference,
            billId: "bill-1",
            billNumber: "議第1号",
            billName: "市条例の一部改正",
          },
          {
            ...reference,
            sessionId: 11,
            billId: "bill-1",
            billNumber: "議第1号",
            billName: "市条例の一部改正",
          },
          {
            ...reference,
            sessionId: 12,
            billId: "unpublished",
            billNumber: null,
            billName: "未公開議案",
          },
          {
            ...reference,
            sessionId: 13,
            billId: "bill-1",
            billNumber: "議第1号",
            billName: "別の議案",
          },
          {
            ...reference,
            sessionId: 14,
            billId: null,
            billNumber: null,
            billName: "IDなし",
          },
        ],
        [
          {
            id: "bill-1",
            name: "市条例の一部改正",
            bill_number: "議第1号",
            tags: [{ id: "tag-1", label: "まちづくり・暮らし" }],
          },
        ]
      )
    ).toEqual([
      {
        id: "bill-1",
        name: "市条例の一部改正",
        bill_number: "議第1号",
        tags: [{ id: "tag-1", label: "まちづくり・暮らし" }],
        references: [reference, { ...reference, sessionId: 11 }],
      },
    ]);
  });
});
