// @vitest-environment jsdom

import { act, cleanup, render, screen } from "@testing-library/react";
import { PathnameContext } from "next/dist/shared/lib/hooks-client-context.shared-runtime";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TopicVoicesSection } from "@/features/bills/client/components/articles/topic-voices-section";
import { BillPickupsView } from "@/features/committee-minutes/server/components/bill-pickups-view";
import { PlenaryMeetingSection } from "@/features/committee-minutes/shared/components/plenary-meeting-section";
import type { BillPickupItem } from "@/features/committee-minutes/shared/utils/build-bill-pickup-items";
import { ReportCard } from "@/features/interview-report/shared/components/report-card";
import { MayorDetailContent } from "@/features/politicians/client/components/mayor-detail-content";
import { PoliticianSpeechSection } from "@/features/politicians/shared/components/politician-speech-section";
import { PressConferenceList } from "@/features/press-conferences/client/components/press-conference-list";
import type { RecentPublications } from "../../shared/types";
import { NewPostBadge, NewPostProvider } from "./new-post-provider";

const now = "2026-11-03T03:00:00.000Z";
const recent = "2026-11-03T02:00:00.000Z";

function response(
  publications: RecentPublications["publications"],
  serverNow = now
) {
  return Response.json({ now: serverNow, publications });
}

function publication(
  contentType: RecentPublications["publications"][number]["content_type"],
  id: string,
  date = recent
) {
  return {
    content_type: contentType,
    content_id: id,
    first_published_at: date,
  };
}

async function settle() {
  await act(async () => {
    await Promise.resolve();
  });
}

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("NewPostProvider", () => {
  it("shares one request across cards and separates content types", async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValue(
        response([
          publication("bill_articles", "same-id"),
          publication("meeting_sessions", "123"),
          publication("interview_report", "report"),
        ])
      );
    vi.stubGlobal("fetch", fetcher);
    render(
      <NewPostProvider>
        <div data-testid="topic">
          <NewPostBadge contentType="bill_articles" contentId="same-id" />
        </div>
        <div data-testid="bill">
          <NewPostBadge contentType="bills" contentId="same-id" />
        </div>
        <div data-testid="archive">
          <NewPostBadge contentType="meeting_sessions" contentId={[1, 123]} />
        </div>
        <div data-testid="report">
          <ReportCard
            report={{
              id: "report",
              stance: null,
              role: null,
              role_title: null,
              municipality_connection: null,
              summary: "公開レポートの見本",
              created_at: recent,
            }}
          />
        </div>
      </NewPostProvider>
    );
    await settle();
    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId("topic").textContent).toContain("NEW");
    expect(screen.getByTestId("bill").textContent).toBe("");
    expect(screen.getByTestId("archive").textContent).toContain("NEW");
    expect(screen.getByTestId("report").textContent).toContain("NEW");
  });

  it("marks voices shown as part of a newly published topic", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          response([publication("bill_articles", "new-topic")])
        )
    );
    render(
      <NewPostProvider>
        <TopicVoicesSection
          articleId="new-topic"
          voices={[
            {
              reportId: "older-report",
              municipalityConnectionLabel: null,
              stance: null,
              roleLabel: null,
              summary: "市民の声",
            },
          ]}
        />
      </NewPostProvider>
    );
    await settle();
    expect(
      screen.getByRole("heading", { name: /みんなの生の声/ }).textContent
    ).toContain("NEW");
    expect(
      screen.getByRole("link", { name: "インタビューレポートを読む →" })
        .nextElementSibling
    ).toBeNull();
  });

  it("marks an interview answer when it is first featured in a topic", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          response([publication("topic_voice", "newly-featured-report")])
        )
    );
    render(
      <NewPostProvider>
        <TopicVoicesSection
          articleId="older-topic"
          voices={[
            {
              reportId: "newly-featured-report",
              municipalityConnectionLabel: null,
              stance: null,
              roleLabel: null,
              summary: "市民の声",
            },
          ]}
        />
      </NewPostProvider>
    );
    await settle();
    const answer = screen
      .getByRole("link", { name: "インタビューレポートを読む →" })
      .closest("li");
    expect(answer?.textContent).toContain("NEW");
    expect(answer?.firstElementChild?.textContent).toMatch(/^NEW/);
    expect(
      answer?.querySelector(
        '[title="トピックス記事に初掲載されてから14日以内の投稿です"]'
      )
    ).not.toBeNull();
    expect(
      screen.getByRole("heading", { name: /みんなの生の声/ }).textContent
    ).not.toContain("NEW");
  });

  it("marks a bill pickup card when the bill or related topic is new", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          response([
            publication("bills", "older-bill"),
            publication("bill_articles", "new-topic"),
          ])
        )
    );
    const item: BillPickupItem = {
      billId: "older-bill",
      description: null,
      kind: "法案",
      updatedAt: null,
      status: "approved",
      categories: [],
      relatedTopicArticleIds: ["new-topic"],
      relatedTopicTitles: ["新しいトピックス"],
      references: [
        {
          meetingId: 1,
          meetingTitle: "本会議",
          meetingType: "本会議",
          sessionId: 10,
          date: "2026-03-26",
          billNumber: "議第35号",
          billName: "条例改正",
          description: null,
        },
      ],
    };
    render(
      <NewPostProvider>
        <BillPickupsView items={[item]} />
      </NewPostProvider>
    );
    await settle();
    expect(
      screen.getAllByTitle("サイトで初めて公開してから14日以内の投稿です")
    ).toHaveLength(1);
    expect(
      screen.getByText("法案").parentElement?.firstElementChild?.textContent
    ).toMatch(/^NEW/);
  });

  it("places NEW before speeches, mayor proposals, conferences and minutes headings", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          response([
            publication("politician_speech_highlights", "speech"),
            publication("meetings", "1"),
            publication("press_conferences", "conference"),
            publication("meeting_sessions", "123"),
          ])
        )
    );
    render(
      <NewPostProvider>
        <PoliticianSpeechSection
          highlights={[
            {
              id: "speech",
              title: "発言の見出し",
              quote: "原文",
              context: null,
              meetingId: 1,
              sessionId: 123,
              meetingType: "本会議",
              meetingTitle: "定例会",
              meetingDate: "2026-03-05",
            },
          ]}
          discussions={[]}
          invalidCount={0}
          isPreview={false}
        />
        <MayorDetailContent
          mayor={null}
          localPreview={false}
          proposals={[
            {
              id: 1,
              title: "提案理由の会議",
              date: "2026-03-05",
              mayor_proposal_summary: "要約",
              mayor_proposal_source_url: null,
            },
          ]}
          conferences={[
            {
              id: "conference",
              slug: "conference",
              title: "市長記者会見",
              held_at: "2026-03-01",
              youtube_url: null,
              status: "published",
              press_conference_items: [],
            },
          ]}
        />
        <PressConferenceList
          pressConferences={[
            {
              id: "conference",
              slug: "conference",
              title: "市長記者会見",
              heldAt: "2026-03-01",
              youtubeUrl: null,
              status: "published",
              items: [],
            },
          ]}
        />
        <PlenaryMeetingSection
          meeting={{
            id: 1,
            title: "定例会",
            date: "2026-03-05",
            sessions: [
              { id: 123, session_title: "議事録の見出し", content: "原文" },
            ],
          }}
        />
      </NewPostProvider>
    );
    await settle();
    for (const title of ["発言の見出し", "提案理由の会議", "議事録の見出し"]) {
      expect(
        screen.getByRole("heading", { name: new RegExp(title) })
          .firstElementChild?.textContent
      ).toMatch(/^NEW/);
    }
    expect(
      screen.getByText("市長記者会見", { selector: "span" }).parentElement
        ?.firstElementChild?.textContent
    ).toMatch(/^NEW/);
  });

  it("refreshes the shared provider on client-side navigation", async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(response([]))
      .mockResolvedValueOnce(response([publication("bill_articles", "topic")]));
    vi.stubGlobal("fetch", fetcher);
    function Page({ path }: { path: string }) {
      return (
        <PathnameContext.Provider value={path}>
          <NewPostProvider>
            <NewPostBadge contentType="bill_articles" contentId="topic" />
          </NewPostProvider>
        </PathnameContext.Provider>
      );
    }
    const { rerender } = render(<Page path="/" />);
    await settle();
    expect(screen.queryByText("NEW")).toBeNull();
    rerender(<Page path="/topics" />);
    await settle();
    expect(fetcher).toHaveBeenCalledTimes(2);
    expect(screen.queryByText("NEW")).not.toBeNull();
  });

  it("pauses background requests and refreshes when the tab becomes visible", async () => {
    vi.useFakeTimers();
    const fetcher = vi
      .fn()
      .mockImplementation(() => Promise.resolve(response([])));
    const visibility = vi
      .spyOn(document, "visibilityState", "get")
      .mockReturnValue("visible");
    vi.stubGlobal("fetch", fetcher);
    render(<NewPostProvider>投稿</NewPostProvider>);
    await settle();
    visibility.mockReturnValue("hidden");
    await act(() => vi.advanceTimersByTimeAsync(60_000));
    expect(fetcher).toHaveBeenCalledTimes(1);
    visibility.mockReturnValue("visible");
    act(() => {
      document.dispatchEvent(new Event("visibilitychange"));
    });
    await settle();
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it("removes NEW at expiry without reloading the page", async () => {
    vi.useFakeTimers({
      toFake: [
        "setTimeout",
        "clearTimeout",
        "setInterval",
        "clearInterval",
        "performance",
      ],
    });
    const initial = "2026-10-20T03:00:01.000Z";
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          response([publication("bill_articles", "topic", initial)])
        )
    );
    render(
      <NewPostProvider>
        <NewPostBadge contentType="bill_articles" contentId="topic" />
      </NewPostProvider>
    );
    await settle();
    expect(screen.queryByText("NEW")).not.toBeNull();
    await act(() => vi.advanceTimersByTimeAsync(999));
    expect(screen.queryByText("NEW")).not.toBeNull();
    await act(() => vi.advanceTimersByTimeAsync(1));
    expect(screen.queryByText("NEW")).toBeNull();
  });

  it("uses server time even when the device clock is wrong", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2040-01-01T00:00:00Z"));
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          response([publication("press_conferences", "conference")])
        )
    );
    render(
      <NewPostProvider>
        <NewPostBadge contentType="press_conferences" contentId="conference" />
      </NewPostProvider>
    );
    await settle();
    expect(screen.queryByText("NEW")).not.toBeNull();
  });

  it("does not revive an expired badge when the publication is refreshed", async () => {
    vi.useFakeTimers();
    const fetcher = vi
      .fn()
      .mockImplementation(() =>
        Promise.resolve(
          response([publication("bills", "bill", "2026-10-01T00:00:00Z")])
        )
      );
    vi.stubGlobal("fetch", fetcher);
    render(
      <NewPostProvider>
        <NewPostBadge contentType="bills" contentId="bill" />
      </NewPostProvider>
    );
    await settle();
    expect(screen.queryByText("NEW")).toBeNull();
    await act(() => vi.advanceTimersByTimeAsync(60_000));
    expect(fetcher).toHaveBeenCalledTimes(2);
    expect(screen.queryByText("NEW")).toBeNull();
  });

  it("reports HTTP and malformed-data failures instead of showing stale NEW", async () => {
    vi.useFakeTimers();
    const errorLog = vi.spyOn(console, "error").mockImplementation(() => {});
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(
        response([publication("general_questions", "question")])
      )
      .mockResolvedValueOnce(new Response("DB error", { status: 500 }))
      .mockResolvedValueOnce(Response.json({ publications: [] }));
    vi.stubGlobal("fetch", fetcher);
    render(
      <NewPostProvider>
        <NewPostBadge contentType="general_questions" contentId="question" />
      </NewPostProvider>
    );
    await settle();
    expect(screen.queryByText("NEW")).not.toBeNull();
    await act(() => vi.advanceTimersByTimeAsync(60_000));
    expect(screen.queryByText("NEW")).toBeNull();
    expect(errorLog).toHaveBeenCalledTimes(1);
    await act(() => vi.advanceTimersByTimeAsync(60_000));
    expect(errorLog).toHaveBeenCalledTimes(2);
    expect(screen.queryByText("NEW")).toBeNull();
  });

  it("does not set state or log an aborted request after unmounting", async () => {
    const errorLog = vi.spyOn(console, "error").mockImplementation(() => {});
    let rejectFetch: (reason: Error) => void = () => {};
    const fetcher = vi.fn().mockImplementation(
      () =>
        new Promise((_resolve, reject) => {
          rejectFetch = reject;
        })
    );
    vi.stubGlobal("fetch", fetcher);
    const { unmount } = render(<NewPostProvider>投稿</NewPostProvider>);
    const signal = fetcher.mock.calls[0][1].signal as AbortSignal;
    unmount();
    expect(signal.aborted).toBe(true);
    rejectFetch(new Error("aborted"));
    await settle();
    expect(errorLog).not.toHaveBeenCalled();
  });
});
