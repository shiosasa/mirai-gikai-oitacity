// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { InterviewWrapUpPrompt } from "./interview-wrap-up-prompt";

describe("InterviewWrapUpPrompt", () => {
  it("回答者がまとめるか続けるかを選べる", async () => {
    const user = userEvent.setup();
    const onSummarize = vi.fn();
    const onContinue = vi.fn();

    render(
      <InterviewWrapUpPrompt
        reason="conversation"
        onSummarize={onSummarize}
        onContinue={onContinue}
        canSummarize={true}
        hasDraft={false}
      />
    );

    expect(screen.getByRole("status")).toHaveTextContent(
      "ひと区切りです。これまでのお話をまとめますか？"
    );
    expect(
      screen.getByText(
        "まだ質問が残っていても、今のお話からレポートを作れます。"
      )
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: "これまでをまとめる" })
    );
    await user.click(screen.getByRole("button", { name: "もう少し話す" }));
    expect(onSummarize).toHaveBeenCalledOnce();
    expect(onContinue).toHaveBeenCalledOnce();
  });

  it("未送信の入力がある場合は失われないよう先に送信するよう案内する", () => {
    render(
      <InterviewWrapUpPrompt
        reason="time"
        onSummarize={() => {}}
        onContinue={() => {}}
        canSummarize={true}
        hasDraft={true}
      />
    );

    expect(screen.getByRole("status")).toHaveTextContent(
      "目安時間になりました"
    );
    expect(
      screen.getByRole("button", { name: "これまでをまとめる" })
    ).toBeDisabled();
    expect(
      screen.getByRole("button", { name: "これまでをまとめる" })
    ).toHaveAccessibleDescription("入力中の内容は先に送信してください。");
    expect(screen.getByRole("button", { name: "もう少し話す" })).toBeEnabled();
  });

  it("まだ回答がないときはまとめる操作を無効にする", () => {
    render(
      <InterviewWrapUpPrompt
        reason="time"
        onSummarize={() => {}}
        onContinue={() => {}}
        canSummarize={false}
        hasDraft={false}
      />
    );

    expect(
      screen.getByText("まずは質問に回答してください。")
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "これまでをまとめる" })
    ).toBeDisabled();
  });
});
