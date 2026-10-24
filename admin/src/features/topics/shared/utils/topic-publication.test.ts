import { describe, expect, it } from "vitest";
import { parseTopicPublicationStatus } from "./topic-publication";

describe("parseTopicPublicationStatus", () => {
  it("accepts only draft and published", () => {
    expect(parseTopicPublicationStatus("draft")).toBe("draft");
    expect(parseTopicPublicationStatus("published")).toBe("published");
    expect(() => parseTopicPublicationStatus("public")).toThrow(
      "公開状態が不正"
    );
    expect(() => parseTopicPublicationStatus("")).toThrow("公開状態が不正");
  });
});
