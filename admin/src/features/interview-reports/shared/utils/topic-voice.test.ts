import { describe, expect, it } from "vitest";
import {
  getTopicVoiceFeatureBlocker,
  getTopicVoiceStatusLabel,
  groupTopicVoicesByTopic,
  normalizeTopicVoiceRow,
  type TopicVoiceRow,
} from "./topic-voice";

const row = (overrides: Partial<TopicVoiceRow>): TopicVoiceRow => ({
  reportId: "r1",
  sessionId: "s1",
  billId: "b1",
  topicTitle: "トピックA",
  stance: "for",
  role: "daily_life_affected",
  roleTitle: "保護者",
  municipalityConnection: "resident",
  summary: "要約",
  isPublicByUser: true,
  isPublicByAdmin: false,
  featuredAt: null,
  createdAt: "2026-11-01T00:00:00Z",
  ...overrides,
});

describe("normalizeTopicVoiceRow", () => {
  const raw = {
    id: "r1",
    interview_session_id: "s1",
    stance: "for",
    role: null,
    role_title: null,
    municipality_connection: "connected" as const,
    summary: "要約",
    is_public_by_user: true,
    is_public_by_admin: false,
    topic_voice_featured_at: null,
    created_at: "2026-11-01T00:00:00Z",
  };

  it("ネストしたセッション・設定・トピックを平坦化する", () => {
    const result = normalizeTopicVoiceRow({
      ...raw,
      interview_sessions: {
        interview_configs: { bill_id: "b1", bills: { name: "トピックA" } },
      },
    });
    expect(result).toMatchObject({
      reportId: "r1",
      sessionId: "s1",
      billId: "b1",
      topicTitle: "トピックA",
      municipalityConnection: "connected",
    });
  });

  it("配列で返る関連も扱える", () => {
    const result = normalizeTopicVoiceRow({
      ...raw,
      interview_sessions: [
        {
          interview_configs: [
            { bill_id: "b1", bills: [{ name: "トピックA" }] },
          ],
        },
      ],
    });
    expect(result?.billId).toBe("b1");
  });

  it("トピックが無い行は null", () => {
    expect(
      normalizeTopicVoiceRow({ ...raw, interview_sessions: null })
    ).toBeNull();
  });
});

describe("getTopicVoiceStatusLabel", () => {
  it("未採用の場合はラベルを表示しない", () => {
    expect(getTopicVoiceStatusLabel(row({}))).toBeNull();
  });

  it("本人と管理者が公開している採用済み回答を表示する", () => {
    expect(
      getTopicVoiceStatusLabel(
        row({
          featuredAt: "2026-11-02T00:00:00Z",
          isPublicByAdmin: true,
        })
      )
    ).toBe("採用済み");
  });

  it.each([
    { isPublicByUser: false, isPublicByAdmin: true },
    { isPublicByUser: true, isPublicByAdmin: false },
  ])("本人または管理者が非公開の場合は明示する", (visibility) => {
    expect(
      getTopicVoiceStatusLabel(
        row({ featuredAt: "2026-11-02T00:00:00Z", ...visibility })
      )
    ).toBe("採用済み（非公開）");
  });
});

describe("groupTopicVoicesByTopic", () => {
  it("トピック単位にまとめ、採用済みを先頭に並べる", () => {
    const groups = groupTopicVoicesByTopic([
      row({ reportId: "new", createdAt: "2026-11-03T00:00:00Z" }),
      row({
        reportId: "featured",
        createdAt: "2026-11-01T00:00:00Z",
        featuredAt: "2026-11-02T00:00:00Z",
      }),
      row({
        reportId: "other",
        billId: "b2",
        topicTitle: "トピックB",
        createdAt: "2026-11-02T00:00:00Z",
      }),
    ]);

    expect(groups.map((g) => g.billId)).toEqual(["b1", "b2"]);
    expect(groups[0].reports.map((r) => r.reportId)).toEqual([
      "featured",
      "new",
    ]);
    expect(groups[0].featuredCount).toBe(1);
    expect(groups[1].featuredCount).toBe(0);
  });
});

describe("getTopicVoiceFeatureBlocker", () => {
  it("同意済みで要約がある回答は採用できる", () => {
    expect(getTopicVoiceFeatureBlocker(row({}), 0)).toBeNull();
  });

  it("本人の公開同意が無い回答は採用できない", () => {
    expect(
      getTopicVoiceFeatureBlocker(row({ isPublicByUser: false }), 0)
    ).toContain("同意");
  });

  it("要約が空の回答は採用できない", () => {
    expect(getTopicVoiceFeatureBlocker(row({ summary: "  " }), 0)).toContain(
      "要約"
    );
  });

  it("上限に達したトピックには新たに採用できない", () => {
    expect(getTopicVoiceFeatureBlocker(row({}), 5)).toContain("5件まで");
  });

  it("採用済みの回答は上限に関係なく判定を通る", () => {
    expect(
      getTopicVoiceFeatureBlocker(
        row({ featuredAt: "2026-11-02T00:00:00Z" }),
        5
      )
    ).toBeNull();
  });
});
