import { describe, expect, it } from "vitest";
import { buildSessionPath } from "./build-session-path";

describe("buildSessionPath", () => {
  it("本会議は plenary のパスを返す", () => {
    expect(
      buildSessionPath({ meeting_type: "本会議", meeting_id: 1, session_id: 8 })
    ).toBe("/committees/plenary/1/8");
  });

  it("委員会は committee のパスを返す", () => {
    expect(
      buildSessionPath({
        meeting_type: "委員会",
        meeting_id: 3,
        session_id: 16,
      })
    ).toBe("/committees/committee/3/16");
  });
});
