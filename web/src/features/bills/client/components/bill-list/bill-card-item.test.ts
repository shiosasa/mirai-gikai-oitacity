// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { createElement } from "react";
import { afterEach, describe, expect, it } from "vitest";
import { createMockBill } from "@/app/dev/_lib/mock-data";
import { BillCard } from "./bill-card-item";

afterEach(cleanup);

describe("BillCard optional content", () => {
  it("expands a bill without content", () => {
    render(
      createElement(BillCard, {
        bill: createMockBill({ bill_content: undefined }),
      })
    );

    fireEvent.click(
      screen.getByRole("button", { name: "詳細・重要ポイントを読む" })
    );

    expect(screen.getByRole("button", { name: "閉じる" })).toBeTruthy();
    expect(screen.queryByText("重要ポイント")).toBeNull();
    expect(screen.queryByText("主に影響を受ける人")).toBeNull();
  });

  it("expands legacy content without optional explanation fields", () => {
    const bill = createMockBill();
    render(createElement(BillCard, { bill }));

    fireEvent.click(
      screen.getByRole("button", { name: "詳細・重要ポイントを読む" })
    );

    expect(screen.getByText("具体的な内容")).toBeTruthy();
    expect(screen.queryByText("重要ポイント")).toBeNull();
    expect(screen.queryByText("主に影響を受ける人")).toBeNull();
  });

  it("keeps optional explanation fields visible when provided", () => {
    const bill = createMockBill();
    if (!bill.bill_content) throw new Error("Missing bill fixture content");
    bill.bill_content = {
      ...bill.bill_content,
      key_points: ["重要な変更"],
      target_audience: ["市民"],
    };
    render(createElement(BillCard, { bill }));

    fireEvent.click(
      screen.getByRole("button", { name: "詳細・重要ポイントを読む" })
    );

    expect(screen.getByText("重要な変更")).toBeTruthy();
    expect(screen.getByText("市民")).toBeTruthy();
  });
});
