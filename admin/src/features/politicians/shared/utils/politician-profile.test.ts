import { describe, expect, it } from "vitest";
import {
  getPoliticianProfileFormValues,
  type PoliticianProfileRecord,
  parsePoliticianProfileForm,
  politicianProfileSchema,
} from "./politician-profile";

const politician: PoliticianProfileRecord = {
  id: "00000000-0000-4000-8000-000000000001",
  name: "確認用議員",
  name_kana: "かくにんようぎいん",
  number: 12,
  birth_date: "昭和50年4月1日",
  election_count: 3,
  faction: "確認用会派",
  standing_committee: "文教常任委員会（委員長）",
  special_committee: "確認特別委員会",
  address: "公式の公開所在地",
  contact: "000-000-0000",
  homepage: "http://example.com/",
  image_url: "https://example.com/photo.jpg",
};

describe("politician profile input", () => {
  it("round trips all Oita fields, preserving ID and Japanese date text", () => {
    const result = parsePoliticianProfileForm(
      getPoliticianProfileFormValues(politician),
      politician.id
    );
    expect(result.success).toBe(true);
    if (!result.success) throw result.error;
    expect(result.data).toEqual(politician);
    expect(result.data).not.toHaveProperty("terms_count");
    expect(result.data).not.toHaveProperty("seat_number");
    expect(result.data).not.toHaveProperty("slug");
  });

  it("keeps new fields blank and nulls optional values without inventing elections", () => {
    const form = getPoliticianProfileFormValues();
    expect(form.number).toBe("");
    const result = parsePoliticianProfileForm({
      ...form,
      name: " 新規議員 ",
      number: "2",
    });
    expect(result.success).toBe(true);
    if (!result.success) throw result.error;
    expect(result.data.name).toBe("新規議員");
    expect(result.data.election_count).toBeNull();
    expect(result.data.name_kana).toBeNull();
    expect(result.data.homepage).toBeNull();
    expect(result.data.id).toBeUndefined();
  });

  it.each([
    "",
    "0",
    "-1",
    "1.5",
    "2147483648",
    "abc",
  ])("rejects invalid required seat number %s", (number) => {
    expect(
      parsePoliticianProfileForm({
        ...getPoliticianProfileFormValues(politician),
        number,
      }).success
    ).toBe(false);
  });

  it.each(["-1", "1.5", "invalid"])("rejects election count %s", (value) => {
    expect(
      parsePoliticianProfileForm({
        ...getPoliticianProfileFormValues(politician),
        election_count: value,
      }).success
    ).toBe(false);
  });

  it.each([
    "javascript:alert(1)",
    "data:image/svg+xml,test",
    "/relative",
  ])("rejects unsafe URLs for both public references: %s", (url) => {
    expect(
      politicianProfileSchema.safeParse({ ...politician, homepage: url })
        .success
    ).toBe(false);
    expect(
      politicianProfileSchema.safeParse({ ...politician, image_url: url })
        .success
    ).toBe(false);
  });

  it("rejects invalid dates, UUIDs, reserved names and malformed direct action input", () => {
    for (const patch of [
      { birth_date: "2001-02-29" },
      { id: "invalid" },
      { name: "欠番" },
      { election_count: "3" },
    ]) {
      expect(
        politicianProfileSchema.safeParse({ ...politician, ...patch }).success
      ).toBe(false);
    }
  });

  it("strips unrelated identity, legacy and publication fields", () => {
    const parsed = politicianProfileSchema.parse({
      ...politician,
      slug: "do-not-change",
      seat_number: 99,
      is_published: false,
      terms_count: 10,
    });
    expect(parsed).toEqual(politician);
  });
});
