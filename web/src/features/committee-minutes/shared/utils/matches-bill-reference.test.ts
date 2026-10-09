import { describe, expect, it } from "vitest";
import { matchesBillReference } from "./matches-bill-reference";

describe("matchesBillReference", () => {
  const bill = {
    name: "大分市学校給食費の管理に関する条例の一部改正について",
    bill_number: "議第35号",
  };

  it("番号と正式名称の両方が一致したときだけ一致する", () => {
    expect(
      matchesBillReference(
        {
          name: "大分市学校給食費の管理に関する条例の一部改正について",
          number: "議第35号",
        },
        bill
      )
    ).toBe(true);
  });

  it("番号または名称が食い違う場合は一致しない", () => {
    expect(
      matchesBillReference(
        {
          name: "給食費無償化の解説記事",
          number: "議第35号",
        },
        bill
      )
    ).toBe(false);
    expect(
      matchesBillReference(
        {
          name: bill.name,
          number: "議第99号",
        },
        bill
      )
    ).toBe(false);
  });

  it("番号がない場合は正式名称の完全一致で判定する", () => {
    expect(matchesBillReference({ name: bill.name, number: null }, bill)).toBe(
      true
    );
    expect(
      matchesBillReference(
        { name: "給食費無償化の解説記事", number: null },
        bill
      )
    ).toBe(false);
  });

  it("名称がない場合は議案番号の完全一致で判定する", () => {
    expect(matchesBillReference({ name: null, number: "議第35号" }, bill)).toBe(
      true
    );
    expect(matchesBillReference({ name: null, number: "議第99号" }, bill)).toBe(
      false
    );
  });

  it("名称と番号がどちらもない場合は一致しない", () => {
    expect(matchesBillReference({ name: null, number: null }, bill)).toBe(
      false
    );
  });
});
