import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { BillPickupsView } from "./bill-pickups-view";

describe("BillPickupsView", () => {
  it("keeps the pickup heading pink with the wisteria photo", () => {
    const html = renderToStaticMarkup(<BillPickupsView items={[]} />);
    expect(html).toContain("ピックアップ");
    expect(html).toContain("議案一覧");
    expect(html).toContain(
      encodeURIComponent("/img/oita/wisteria-bridge.webp")
    );
    expect(html).toContain("from-oita-pink-light to-oita-pink-accent");
  });
});
