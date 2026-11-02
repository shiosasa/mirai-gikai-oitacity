// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import {
  INTERVIEW_CONTINUE_REQUEST_MESSAGE,
  INTERVIEW_SUMMARY_REQUEST_MESSAGE,
} from "../utils/interview-wrap-up";

const { mockSubmit, mockState } = vi.hoisted(() => ({
  mockSubmit: vi.fn(),
  mockState: {
    object: undefined as unknown,
    onFinish: undefined as
      | ((result: { object?: unknown; error?: Error }) => void)
      | undefined,
  },
}));

vi.mock("@ai-sdk/react", () => ({
  experimental_useObject: (options: {
    onFinish?: (result: { object?: unknown; error?: Error }) => void;
  }) => {
    mockState.onFinish = options.onFinish;
    return {
      object: mockState.object,
      submit: mockSubmit,
      isLoading: false,
      error: undefined,
    };
  },
}));

vi.mock("../../server/actions/submit-interview-nickname", () => ({
  submitInterviewNickname: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("../../server/actions/submit-interview-rating", () => ({
  submitInterviewRating: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/components/ai-elements/response", () => ({
  Response: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

import { InterviewChatClient } from "./interview-chat-client";

beforeAll(() => {
  global.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
});

beforeEach(() => {
  mockSubmit.mockClear();
  mockState.object = undefined;
  mockState.onFinish = undefined;
});

afterEach(() => {
  vi.unstubAllGlobals();
});

function assistantMessage(index: number, nextStage = "chat") {
  return {
    id: `assistant-${index}`,
    role: "assistant" as const,
    content: JSON.stringify({
      text: nextStage === "chat" ? "次の質問です" : "まとめますか？",
      question_id: `question-${index}`,
      quick_replies: ["はい"],
      next_stage: nextStage,
    }),
    created_at: "2024-01-01T00:00:00Z",
  };
}

function initialMessages(answerCount: number, lastStage = "chat") {
  return [
    assistantMessage(0),
    ...Array.from({ length: answerCount }, (_, index) => [
      {
        id: `user-${index}`,
        role: "user" as const,
        content: index === 0 ? "大分市に住んでいる" : `回答${index + 1}`,
        created_at: "2024-01-01T00:00:00Z",
      },
      assistantMessage(
        index + 1,
        index === answerCount - 1 ? lastStage : "chat"
      ),
    ]).flat(),
  ];
}

async function openInterview(
  answerCount: number,
  options: {
    mode?: "loop" | "bulk";
    lastStage?: string;
    estimatedDuration?: number;
    sessionStartedAt?: string;
  } = {}
) {
  const user = userEvent.setup();
  render(
    <InterviewChatClient
      billId="bill-1"
      sessionId="session-1"
      initialMessages={initialMessages(answerCount, options.lastStage)}
      mode={options.mode}
      totalQuestions={8}
      estimatedDuration={options.estimatedDuration}
      sessionStartedAt={options.sessionStartedAt}
    />
  );
  await user.click(screen.getByRole("button", { name: "対話を開始する🌸" }));
  return user;
}

function finishChatResponse(nextStage = "chat") {
  act(() => {
    mockState.onFinish?.({
      object: {
        text: nextStage === "chat" ? "次の質問です" : "まとめますか？",
        next_stage: nextStage,
        question_id: `question-${Date.now()}`,
        quick_replies: ["はい"],
      },
    });
  });
}

describe("インタビューのまとめへの案内", () => {
  it.each([
    "loop",
    "bulk",
  ] as const)("%sモードで6回目の回答後に選択肢を表示する", async (mode) => {
    const user = await openInterview(5, { mode });

    expect(
      screen.queryByText("ひと区切りです。これまでのお話をまとめますか？")
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "これまでのお話をまとめる" })
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "はい" }));
    finishChatResponse();

    expect(
      screen.getByText("ひと区切りです。これまでのお話をまとめますか？")
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "これまでをまとめる" })
    ).toBeEnabled();
    expect(screen.getByRole("button", { name: "もう少し話す" })).toBeEnabled();
  });

  it("続ける選択後、3回答後に再案内し、タイマーを消さない", async () => {
    const user = await openInterview(6, {
      mode: "loop",
      estimatedDuration: 30,
      sessionStartedAt: new Date().toISOString(),
    });

    await user.click(screen.getByRole("button", { name: "もう少し話す" }));
    expect(screen.getByText(/残り約 .* 分/)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "これまでのお話をまとめる" })
    ).toBeInTheDocument();

    for (let index = 0; index < 3; index += 1) {
      await user.click(screen.getByRole("button", { name: "はい" }));
      finishChatResponse();
      if (index < 2) {
        expect(
          screen.queryByText("ひと区切りです。これまでのお話をまとめますか？")
        ).not.toBeInTheDocument();
      }
    }

    expect(
      screen.getByText("ひと区切りです。これまでのお話をまとめますか？")
    ).toBeInTheDocument();
  });

  it("目安時間と回答回数が重なっても案内は1つで、要約を直接要求する", async () => {
    const user = await openInterview(6, {
      estimatedDuration: 1,
      sessionStartedAt: new Date(Date.now() - 10 * 60_000).toISOString(),
    });

    expect(screen.getByText(/目安時間になりました/)).toBeInTheDocument();
    expect(
      screen.queryByText("ひと区切りです。これまでのお話をまとめますか？")
    ).not.toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: "これまでをまとめる" })
    );
    expect(mockSubmit).toHaveBeenCalledOnce();
    expect(mockSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        currentStage: "summary",
        messages: expect.arrayContaining([
          { role: "user", content: INTERVIEW_SUMMARY_REQUEST_MESSAGE },
        ]),
      })
    );
  });

  it("AIが先にまとめを提案しても確認を待ち、続行なら次の質問を要求する", async () => {
    const user = await openInterview(2, { lastStage: "summary" });

    expect(
      screen.getByRole("button", { name: "これまでをまとめる" })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "はい" })
    ).not.toBeInTheDocument();
    expect(mockSubmit).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "もう少し話す" }));
    expect(mockSubmit).toHaveBeenCalledOnce();
    expect(mockSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        currentStage: "chat",
        messages: expect.arrayContaining([
          { role: "user", content: INTERVIEW_CONTINUE_REQUEST_MESSAGE },
        ]),
      })
    );
  });

  it("入力途中に続行を選んでも、文章を消したり自動送信したりしない", async () => {
    const user = await openInterview(2, { lastStage: "summary", mode: "loop" });
    const input = screen.getByPlaceholderText("AIに質問に回答する");

    await user.type(input, "まだ送っていない内容");
    expect(
      screen.getByRole("button", { name: "これまでをまとめる" })
    ).toBeDisabled();
    expect(screen.getByRole("button", { name: "スキップする" })).toBeDisabled();
    await user.click(screen.getByRole("button", { name: "もう少し話す" }));

    expect(input).toHaveValue("まだ送っていない内容");
    expect(mockSubmit).not.toHaveBeenCalled();
  });

  it("再開後の新しい要約を生成中は、以前のレポートを提出できない", async () => {
    const user = userEvent.setup();
    const previousReport = {
      id: "previous-report",
      role: "assistant" as const,
      content: JSON.stringify({
        text: "前のまとめです",
        next_stage: "summary",
        report: { summary: "以前の要約", opinions: [] },
      }),
      created_at: "2024-01-01T00:00:00Z",
    };
    const resumeRequest = {
      id: "resume-request",
      role: "user" as const,
      content: "もう少し続けたいです",
      created_at: "2024-01-01T00:00:01Z",
    };
    render(
      <InterviewChatClient
        billId="bill-1"
        sessionId="session-1"
        initialMessages={[
          ...initialMessages(1),
          previousReport,
          resumeRequest,
          assistantMessage(10),
        ]}
      />
    );
    await user.click(screen.getByRole("button", { name: "対話を開始する🌸" }));
    await user.click(
      screen.getByRole("button", { name: "これまでのお話をまとめる" })
    );

    expect(mockSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ currentStage: "summary" })
    );
    expect(
      screen.queryByRole("button", { name: "レポート内容に同意して提出" })
    ).not.toBeInTheDocument();
  });

  it("レポートが作成できない場合はエラーを示し再試行できる", async () => {
    const user = await openInterview(2);
    await user.click(
      screen.getByRole("button", { name: "これまでのお話をまとめる" })
    );

    const invalidResponse = {
      object: { text: "まとめました", next_stage: "summary", report: null },
    };
    mockState.object = invalidResponse.object;
    act(() => mockState.onFinish?.(invalidResponse));
    act(() => mockState.onFinish?.(invalidResponse));

    expect(
      screen.getByText("エラーが発生しました。もう一度お試しください。")
    ).toBeInTheDocument();
    expect(screen.queryByText("まとめました")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "レポート内容に同意して提出" })
    ).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "もう一度試す" }));
    expect(mockSubmit).toHaveBeenCalledTimes(3);
    expect(mockSubmit).toHaveBeenLastCalledWith(
      expect.objectContaining({ currentStage: "summary", isRetry: true })
    );
  });

  it("AIの提案後にまとめを選ぶとレポート案と公開設定を確認できる", async () => {
    const user = await openInterview(5);

    await user.click(screen.getByRole("button", { name: "はい" }));
    finishChatResponse("summary");
    expect(mockSubmit).toHaveBeenCalledOnce();
    expect(
      screen.getByRole("button", { name: "これまでをまとめる" })
    ).toBeEnabled();

    await user.click(
      screen.getByRole("button", { name: "これまでをまとめる" })
    );
    expect(mockSubmit).toHaveBeenCalledTimes(2);
    expect(mockSubmit).toHaveBeenLastCalledWith(
      expect.objectContaining({ currentStage: "summary" })
    );

    act(() => {
      mockState.onFinish?.({
        object: {
          text: "お話をまとめました。",
          next_stage: "summary",
          report: {
            summary: "交通への意見",
            stance: "neutral",
            role: "general_citizen",
            role_description: "暮らしに関心がある",
            role_title: "市民",
            municipality_connection: "resident",
            opinions: [{ title: "移動", content: "移動しやすくしたい" }],
          },
        },
      });
    });

    expect(screen.getByText("交通への意見")).toBeInTheDocument();
    expect(screen.getByText(/市とのつながり：/)).toHaveTextContent(
      "大分市在住"
    );
    await user.click(
      screen.getByRole("button", { name: "レポート内容に同意して提出" })
    );
    expect(
      screen.getByRole("dialog", { name: "公開設定" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "公開を許可して提出する" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "非公開で提出する" })
    ).toBeInTheDocument();
  });

  it("提出に失敗した場合、公開設定の中でエラーを伝え再試行できる", async () => {
    const user = await openInterview(2);
    await user.click(
      screen.getByRole("button", { name: "これまでのお話をまとめる" })
    );
    act(() => {
      mockState.onFinish?.({
        object: {
          text: "お話をまとめました。",
          next_stage: "summary",
          report: { summary: "交通への意見", opinions: [] },
        },
      });
    });

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({
          error:
            "最新のレポートを確認できませんでした。しばらく待ってからもう一度お試しください。",
        }),
      })
    );
    await user.click(
      screen.getByRole("button", { name: "レポート内容に同意して提出" })
    );
    const dialog = screen.getByRole("dialog", { name: "公開設定" });
    await user.click(
      within(dialog).getByRole("button", { name: "非公開で提出する" })
    );

    expect(await within(dialog).findByRole("alert")).toHaveTextContent(
      "最新のレポートを確認できませんでした"
    );
    expect(
      within(dialog).getByRole("button", { name: "非公開で提出する" })
    ).toBeEnabled();
  });
});
