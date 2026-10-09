import { describe, expect, it } from "vitest";
import { getStatusBadgeClass } from "./get-status-badge-class";

describe("getStatusBadgeClass", () => {
  it("GAS の statusClass を背景色クラスに変換する", () => {
    expect(getStatusBadgeClass("status-settled")).toBe("bg-oita-pink");
    expect(getStatusBadgeClass("status-review")).toBe("bg-blue-500");
    expect(getStatusBadgeClass("status-discussions")).toBe("bg-amber-500");
    expect(getStatusBadgeClass("status-before")).toBe("bg-gray-400");
  });

  it("ラベル文字列からも変換できる", () => {
    expect(getStatusBadgeClass("予算可決")).toBe("bg-oita-pink");
    expect(getStatusBadgeClass("法案成立")).toBe("bg-oita-pink");
    expect(getStatusBadgeClass("計画承認")).toBe("bg-oita-pink");
    expect(getStatusBadgeClass("審議中")).toBe("bg-blue-500");
    expect(getStatusBadgeClass("議会提言")).toBe("bg-amber-500");
    expect(getStatusBadgeClass("提出前")).toBe("bg-gray-400");
  });

  it("未知の値・null はフォールバック色を返す", () => {
    expect(getStatusBadgeClass("unknown")).toBe("bg-gray-500");
    expect(getStatusBadgeClass(null)).toBe("bg-gray-500");
    expect(getStatusBadgeClass(undefined)).toBe("bg-gray-500");
  });
});
