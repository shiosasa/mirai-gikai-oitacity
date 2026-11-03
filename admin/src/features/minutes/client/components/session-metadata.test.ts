// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { createElement } from "react";
import { afterEach, describe, expect, it } from "vitest";
import { sessionMetadataInput } from "@/features/content-management/shared/utils/content-input";
import { SessionMetadata } from "./session-metadata";

afterEach(cleanup);

describe("議事録の出席者・議案編集", () => {
  it("新規入力でも公開画面が要求する配列を揃える", () => {
    const { container } = render(
      createElement(SessionMetadata, {
        initial: { attendees: null, bills: null },
      })
    );
    fireEvent.change(screen.getByLabelText("議長・委員長"), {
      target: { value: "大分 太郎" },
    });
    const field = container.querySelector<HTMLInputElement>(
      'input[name="metadata"]'
    );
    const result = sessionMetadataInput.parse(JSON.parse(field?.value ?? "{}"));
    expect(result.attendees).toEqual({
      chair: "大分 太郎",
      vice_chair: null,
      members: [],
      absent: [],
      officials: [],
    });
  });
  it("変更した項目以外の既存情報・連携を維持する", () => {
    const initial = sessionMetadataInput.parse({
      attendees: {
        members: ["市議A"],
        officials: ["担当職員"],
        source: "既存出典",
      },
      bills: [
        { name: "条例案", number: "1", billId: "既存のリンク", extra: "保持" },
      ],
    });
    const { container } = render(createElement(SessionMetadata, { initial }));
    fireEvent.change(screen.getByLabelText("議案名"), {
      target: { value: "条例改正案" },
    });
    fireEvent.change(screen.getByLabelText("欠席議員（1行1人）"), {
      target: { value: "市議B\n市議C" },
    });
    const field = container.querySelector<HTMLInputElement>(
      'input[name="metadata"]'
    );
    const result = sessionMetadataInput.parse(JSON.parse(field?.value ?? "{}"));
    expect(result.attendees).toMatchObject({
      members: ["市議A"],
      absent: ["市議B", "市議C"],
      officials: ["担当職員"],
      source: "既存出典",
    });
    expect(result.bills?.[0]).toMatchObject({
      name: "条例改正案",
      billId: "既存のリンク",
      extra: "保持",
    });
  });
  it("複数議案の入力値が混ざらない", () => {
    const { container } = render(
      createElement(SessionMetadata, {
        initial: { attendees: null, bills: null },
      })
    );
    fireEvent.click(screen.getByRole("button", { name: "議案を追加" }));
    fireEvent.click(screen.getByRole("button", { name: "議案を追加" }));
    const names = screen.getAllByLabelText("議案名");
    fireEvent.change(names[0], { target: { value: "予算案" } });
    fireEvent.change(names[1], { target: { value: "条例案" } });
    const field = container.querySelector<HTMLInputElement>(
      'input[name="metadata"]'
    );
    expect(
      sessionMetadataInput
        .parse(JSON.parse(field?.value ?? "{}"))
        .bills?.map((bill) => bill.name)
    ).toEqual(["予算案", "条例案"]);
  });
});
