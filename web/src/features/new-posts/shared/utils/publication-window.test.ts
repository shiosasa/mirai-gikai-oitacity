import { describe, expect, it } from "vitest";
import {
  getNewPublicationState,
  isNewPublication,
  NEW_POST_DURATION_MS,
  publicationKey,
} from "./publication-window";

describe("isNewPublication", () => {
  const publishedAt = "2026-11-03T03:00:00.000Z";
  const start = Date.parse(publishedAt);

  it("shows NEW from the initial publication instant", () => {
    expect(isNewPublication(publishedAt, start)).toBe(true);
    expect(
      isNewPublication(publishedAt, start + NEW_POST_DURATION_MS - 1)
    ).toBe(true);
  });

  describe("getNewPublicationState", () => {
    const now = Date.parse("2026-11-03T00:00:00Z");
    it("combines active keys and finds the earliest actual expiration", () => {
      const state = getNewPublicationState(
        [
          {
            content_type: "bills",
            content_id: "1",
            first_published_at: "2026-10-30T00:00:00Z",
          },
          {
            content_type: "interview_report",
            content_id: "1",
            first_published_at: "2026-11-01T00:00:00Z",
          },
          {
            content_type: "bill_articles",
            content_id: "expired",
            first_published_at: "2026-10-20T00:00:00Z",
          },
          {
            content_type: "site_information",
            content_id: "future",
            first_published_at: "2026-11-04T00:00:00Z",
          },
        ],
        now
      );
      expect([...state.activeKeys]).toEqual(["bills:1", "interview_report:1"]);
      expect(state.nextExpiry).toBe(Date.parse("2026-11-13T00:00:00Z"));
    });

    it("does not schedule a timer for empty, invalid, or expired entries", () => {
      const state = getNewPublicationState(
        [
          {
            content_type: "bills",
            content_id: "1",
            first_published_at: "2026-10-20T00:00:00Z",
          },
          {
            content_type: "bills",
            content_id: "2",
            first_published_at: "invalid",
          },
        ],
        now
      );
      expect(state.activeKeys.size).toBe(0);
      expect(state.nextExpiry).toBeNull();
      expect(getNewPublicationState([], now).nextExpiry).toBeNull();
    });
  });

  it("expires at exactly fourteen elapsed days", () => {
    expect(isNewPublication(publishedAt, start + NEW_POST_DURATION_MS)).toBe(
      false
    );
    expect(
      isNewPublication(publishedAt, start + NEW_POST_DURATION_MS + 1)
    ).toBe(false);
  });

  it("does not show future, unknown, or invalid publications", () => {
    expect(isNewPublication(publishedAt, start - 1)).toBe(false);
    for (const value of [null, undefined, "", "invalid"]) {
      expect(isNewPublication(value, start)).toBe(false);
    }
    expect(isNewPublication(publishedAt, Number.NaN)).toBe(false);
  });

  it("treats JST and UTC as the same instant, including over midnight", () => {
    const jst = "2026-11-03T00:00:00+09:00";
    const utc = "2026-11-02T15:00:00Z";
    const expiry = Date.parse(utc) + NEW_POST_DURATION_MS;
    expect(isNewPublication(jst, expiry - 1)).toBe(true);
    expect(isNewPublication(jst, expiry)).toBe(false);
  });
});

describe("publicationKey", () => {
  it("normalizes numeric ids and separates tables with equal ids", () => {
    expect(publicationKey("meeting_sessions", 12)).toBe(
      publicationKey("meeting_sessions", "12")
    );
    expect(publicationKey("meetings", 12)).not.toBe(
      publicationKey("meeting_sessions", 12)
    );
  });
});
