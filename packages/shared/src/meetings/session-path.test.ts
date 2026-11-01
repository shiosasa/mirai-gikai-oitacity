import { describe, expect, it } from "vitest";
import { buildSessionPath } from "./session-path";

describe("buildSessionPath", () => {
  it("builds plenary and committee session links", () => {
    expect(
      buildSessionPath({ meeting_type: "本会議", meeting_id: 2, session_id: 12 })
    ).toBe("/committees/plenary/2/12");
    expect(
      buildSessionPath({ meeting_type: "委員会", meeting_id: 4, session_id: 28 })
    ).toBe("/committees/committee/4/28");
  });

  it("preserves the existing fallback for other meeting types", () => {
    expect(
      buildSessionPath({ meeting_type: "その他", meeting_id: 4, session_id: 28 })
    ).toBe("/committees/committee/4/28");
  });
});
