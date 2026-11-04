import { describe, expect, it } from "vitest";
import {
  archiveInput,
  conferenceInput,
  conferenceItemInput,
  conferenceTurnInput,
  httpUrl,
  listQueryInput,
  meetingInput,
  nonEmptyLines,
  pageHref,
  proposalInput,
  sessionMetadataInput,
  youtubeUrl,
} from "./content-input";

describe("管理画面の入力検証", () => {
  it("不正なURLや資格情報入りURLを拒否する", () => {
    for (const url of [
      "javascript:alert(1)",
      "data:text/html,test",
      "https://user:pass@example.com",
      "xxx",
    ]) {
      expect(httpUrl.safeParse(url).success).toBe(false);
    }
    expect(httpUrl.safeParse("").success).toBe(true);
    expect(
      httpUrl.safeParse("https://www.city.oita.oita.jp/test.pdf").success
    ).toBe(true);
  });
  it("対象動画IDのあるYouTube URLだけを受け付ける", () => {
    for (const url of [
      "https://www.youtube.com/watch?v=abcdefghijk",
      "https://youtu.be/abcdefghijk",
      "https://www.youtube.com/embed/abcdefghijk",
      "",
    ]) {
      expect(youtubeUrl.safeParse(url).success).toBe(true);
    }
    for (const url of [
      "https://youtube.com.evil.test/watch?v=abcdefghijk",
      "https://youtube.com/watch",
      "https://youtube.com/live/abcdefghijk",
      "invalid",
    ]) {
      expect(youtubeUrl.safeParse(url).success).toBe(false);
    }
  });
  it("実在する日付と会議区分を要求する", () => {
    const input = {
      title: "定例会",
      date: "2026-11-03",
      term: "令和8年第4回",
      meeting_type: "本会議",
    };
    expect(meetingInput.safeParse(input).success).toBe(true);
    expect(
      meetingInput.safeParse({ ...input, date: "2026-02-30" }).success
    ).toBe(false);
    expect(
      meetingInput.safeParse({ ...input, meeting_type: "その他" }).success
    ).toBe(false);
  });
  it("提案理由は原文のない要約だけを公開対象にしない", () => {
    const input = {
      mayor_proposal_text: "",
      mayor_proposal_summary: "要約",
      mayor_proposal_source_url: "",
    };
    expect(proposalInput.safeParse(input).success).toBe(false);
    expect(
      proposalInput.safeParse({ ...input, mayor_proposal_text: "原文" }).success
    ).toBe(true);
    expect(
      proposalInput.safeParse({ ...input, mayor_proposal_summary: "" }).success
    ).toBe(true);
  });
  it("不正な公開状態・slug・空見出しを拒否する", () => {
    const input = {
      title: "記者会見",
      held_at: "2026-11-03",
      slug: "2026-11-03",
      status: "draft",
      youtube_url: "",
    };
    expect(conferenceInput.safeParse(input).success).toBe(true);
    expect(
      conferenceInput.safeParse({ ...input, status: "public" }).success
    ).toBe(false);
    expect(
      conferenceInput.safeParse({ ...input, slug: "../test" }).success
    ).toBe(false);
    expect(conferenceInput.safeParse({ ...input, title: " " }).success).toBe(
      false
    );
  });
  it("項目と発言の順序は非負整数、話者は既存区分を使う", () => {
    const turn = {
      speaker: "secretariat",
      speaker_name: "担当課",
      content: "答弁",
      order_index: 0,
    };
    expect(conferenceTurnInput.safeParse(turn).success).toBe(true);
    expect(
      conferenceTurnInput.safeParse({ ...turn, order_index: -1 }).success
    ).toBe(false);
    expect(
      conferenceTurnInput.safeParse({ ...turn, content: " " }).success
    ).toBe(false);
    expect(
      conferenceTurnInput.safeParse({ ...turn, speaker: "mayor" }).success
    ).toBe(false);
    expect(
      conferenceItemInput.safeParse({
        item_type: "qa",
        title: "質疑",
        summary: "",
        detail: "詳細",
        material_url: "",
        order_index: "2",
      }).success
    ).toBe(true);
  });
  it("未知のメタデータは消さず、型違いは拒否する", () => {
    const input = {
      attendees: { members: ["市議A"], officials: ["担当職員"], extra: "保持" },
      bills: [{ name: "条例案", number: "1", billId: "既存リンク" }],
    };
    expect(sessionMetadataInput.parse(input)).toMatchObject(input);
    expect(
      sessionMetadataInput.parse({ attendees: { chair: "議長" }, bills: null })
        .attendees
    ).toEqual({
      chair: "議長",
      vice_chair: null,
      members: [],
      absent: [],
      officials: [],
    });
    expect(
      sessionMetadataInput.safeParse({
        attendees: { members: "市議A" },
        bills: [],
      }).success
    ).toBe(false);
    expect(
      sessionMetadataInput.safeParse({
        attendees: null,
        bills: [{ title: "議案" }],
      }).success
    ).toBe(false);
  });
  it("委員会アーカイブの公開には要約が必要", () => {
    expect(
      archiveInput.safeParse({ summary: " ", publish_status: "published" })
        .success
    ).toBe(false);
    expect(
      archiveInput.safeParse({ summary: "", publish_status: "draft" }).success
    ).toBe(true);
  });
  it("一覧の範囲とフィルタを検証する", () => {
    expect(listQueryInput.parse({}).page).toBe(1);
    for (const page of ["0", "-1", "abc", "1.5"]) {
      expect(listQueryInput.safeParse({ page }).success).toBe(false);
    }
    expect(pageHref("/minutes", { type: "委員会", page: "1" }, 2)).toBe(
      "/minutes?type=%E5%A7%94%E5%93%A1%E4%BC%9A&page=2"
    );
    expect(nonEmptyLines(" A\r\n\n B \n")).toEqual(["A", "B"]);
  });
});
