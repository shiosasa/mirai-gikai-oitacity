// @vitest-environment jsdom

import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { BillStatusEnum } from "../../../shared/types";
import { BillStatusProgress } from "./bill-status-progress";

describe("BillStatusProgress decision date", () => {
  it.each<BillStatusEnum>([
    "approved",
    "rejected",
    "adopted",
    "partially_adopted",
  ])("shows the official decision date for %s", (status) => {
    const html = renderToStaticMarkup(
      <BillStatusProgress
        status={status}
        decisionDate="2026-06-26"
        statusNote="議案全体の議決結果"
      />
    );
    expect(html).toContain('dateTime="2026-06-26"');
    expect(html).toContain("2026/06/26");
    expect(html).toContain("議決日：");
    expect(html).toContain("議案全体の議決結果");
  });

  it("does not invent a date when it is unknown", () => {
    const html = renderToStaticMarkup(<BillStatusProgress status="approved" />);
    expect(html).not.toContain("<time");
    expect(html).not.toContain("議決日：");
    expect(html).toContain("可決");
  });

  it("does not show an old decision date while deliberation is ongoing", () => {
    const html = renderToStaticMarkup(
      <BillStatusProgress status="in_committee" decisionDate="2026-06-26" />
    );
    expect(html).not.toContain("<time");
    expect(html).toContain("委員会審査中");
  });
});
