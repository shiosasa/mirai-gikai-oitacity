// @vitest-environment jsdom
import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useInterviewChat } from "./use-interview-chat";

const initialMessages = [
  {
    id: "answer-1",
    role: "user" as const,
    content: "交通を便利にしたいです",
    created_at: "2026-01-01T00:00:00Z",
  },
];

const summaryResponse = {
  text: "お話をまとめました。",
  next_stage: "summary",
  report: {
    summary: "交通を便利にしたい",
    stance: "neutral",
    role: "general_citizen",
    role_description: "移動に関心がある",
    role_title: "市民",
    municipality_connection: null,
    opinions: [
      {
        title: "移動",
        content: "交通を便利にしたい",
        source_message_id: null,
      },
    ],
    scores: {
      total: 70,
      clarity: 70,
      specificity: 70,
      impact: 70,
      constructiveness: 70,
      reasoning: "意見が示されている",
    },
  },
};

function response(body: unknown) {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("useInterviewChat with streamed responses", () => {
  it("レポートがない要約応答を実際に再試行し、有効なレポートを表示する", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        response({ text: "まとめました", next_stage: "summary", report: null })
      )
      .mockResolvedValueOnce(response(summaryResponse));
    vi.stubGlobal("fetch", fetchMock);
    const { result } = renderHook(() =>
      useInterviewChat({ billId: "bill-1", initialMessages })
    );

    act(() => result.current.handleRequestSummary());

    await waitFor(() => {
      expect(result.current.messages.at(-1)?.report?.summary).toBe(
        "交通を便利にしたい"
      );
    });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock).toHaveBeenLastCalledWith(
      "/api/interview/chat",
      expect.objectContaining({
        body: expect.stringContaining('"isRetry":true'),
      })
    );
    expect(result.current.stage).toBe("summary");
    expect(result.current.error).toBeFalsy();
  });

  it("通信失敗後は同じ要約リクエストを手動で再試行できる", async () => {
    const fetchMock = vi
      .fn()
      .mockRejectedValueOnce(new Error("network error"))
      .mockResolvedValueOnce(response(summaryResponse));
    vi.stubGlobal("fetch", fetchMock);
    const { result } = renderHook(() =>
      useInterviewChat({ billId: "bill-1", initialMessages })
    );

    act(() => result.current.handleRequestSummary());
    await waitFor(() => expect(result.current.error).toBeTruthy());
    expect(result.current.canRetry).toBe(true);

    act(() => result.current.handleRetry());
    await waitFor(() => {
      expect(result.current.messages.at(-1)?.report?.summary).toBe(
        "交通を便利にしたい"
      );
    });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock).toHaveBeenLastCalledWith(
      "/api/interview/chat",
      expect.objectContaining({
        body: expect.stringContaining('"isRetry":true'),
      })
    );
    expect(result.current.error).toBeFalsy();
  });
});
