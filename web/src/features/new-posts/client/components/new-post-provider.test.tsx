// @vitest-environment jsdom

import { act, cleanup, render, screen } from "@testing-library/react";
import { PathnameContext } from "next/dist/shared/lib/hooks-client-context.shared-runtime";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ReportCard } from "@/features/interview-report/shared/components/report-card";
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
