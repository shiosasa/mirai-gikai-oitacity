import { describe, expect, it } from "vitest";
import {
  getMayorProfileFormValues,
  type MayorProfileRecord,
  mayorProfileInputSchema,
  parseMayorProfileForm,
} from "./mayor-profile";

const mayor: MayorProfileRecord = {
  id: 1,
  name: "確認用市長",
  name_kana: "かくにんようしちょう",
  birth_date: "昭和40年1月1日",
  image_url: "https://example.com/photo.jpg",
  official_url: "https://www.city.oita.oita.jp/",
  start_date: "2023-04-17",
  term_number: 1,
  bio: "経歴です。\n基本方針です。",
};

describe("mayor profile input", () => {
  it("round trips all editable fields and preserves Japanese dates and biography lines", () => {
    const parsed = parseMayorProfileForm(getMayorProfileFormValues(mayor));
    expect(parsed.success).toBe(true);
    if (!parsed.success) throw parsed.error;
    const { id, ...content } = mayor;
    expect(parsed.data).toEqual(content);
    expect(mayorProfileInputSchema.parse({ id, content: parsed.data })).toEqual(
      {
        id,
        content,
      }
    );
  });

  it("clears optional fields without inventing dates or terms", () => {
    const form = getMayorProfileFormValues({
      ...mayor,
      name_kana: null,
      birth_date: null,
      start_date: null,
      term_number: null,
      image_url: null,
      official_url: null,
      bio: null,
    });
    const parsed = parseMayorProfileForm({ ...form, name: " 確認用市長 " });
    expect(parsed.success).toBe(true);
    if (!parsed.success) throw parsed.error;
    expect(parsed.data).toEqual({
      name: "確認用市長",
      name_kana: null,
      birth_date: null,
      start_date: null,
      term_number: null,
      image_url: null,
      official_url: null,
      bio: null,
    });
  });

  it.each([
    "javascript:alert(1)",
    "data:image/svg+xml,test",
    "/relative",
    "https://user:pass@example.com/",
  ])("rejects unsafe URLs: %s", (url) => {
    for (const key of ["image_url", "official_url"]) {
      expect(
        parseMayorProfileForm({
          ...getMayorProfileFormValues(mayor),
          [key]: url,
        }).success
      ).toBe(false);
    }
  });

  it.each([
    "0",
    "-1",
    "1.5",
    "2147483648",
    "invalid",
  ])("rejects invalid term number %s", (term_number) => {
    expect(
      parseMayorProfileForm({
        ...getMayorProfileFormValues(mayor),
        term_number,
      }).success
    ).toBe(false);
  });

  it("validates calendar dates, a required name and server-side numeric ID", () => {
    for (const patch of [
      { birth_date: "2001-02-29" },
      { start_date: "2023-02-30" },
      { name: " " },
    ]) {
      expect(
        parseMayorProfileForm({ ...getMayorProfileFormValues(mayor), ...patch })
          .success
      ).toBe(false);
    }
    for (const id of [-1, 0, 1.5, "1", Number.MAX_SAFE_INTEGER + 1]) {
      expect(
        mayorProfileInputSchema.safeParse({ id, content: mayor }).success
      ).toBe(false);
    }
  });

  it("does not allow identity, current status or retirement date inside the saved content", () => {
    const parsed = mayorProfileInputSchema.parse({
      id: mayor.id,
      content: {
        ...mayor,
        is_current: false,
        end_date: "2026-01-01",
        created_at: "2020-01-01",
      },
    });
    expect(parsed.content).not.toHaveProperty("id");
    expect(parsed.content).not.toHaveProperty("is_current");
    expect(parsed.content).not.toHaveProperty("end_date");
    expect(parsed.content).not.toHaveProperty("created_at");
  });
});
