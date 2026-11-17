// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import {
  selectTopicSource,
  type TopicSourceOption,
} from "../../shared/utils/topic-sources";
import { TopicSourceFields } from "./topic-source-fields";

afterEach(cleanup);
const option: TopicSourceOption = {
  sessionId: 3,
  meetingId: 1,
  meetingType: "委員会",
  meetingTitle: "文教委員会",
  sessionLabel: "審査",
  date: "2026-11-05",
  bills: [{ name: "学校条例", number: "第1号" }],
};

describe("TopicSourceFields", () => {
  it("adds a session, selects its bill, retains a quote and removes the source", () => {
    const { container } = render(
      <form>
        <TopicSourceFields initial={[]} options={[option]} />
      </form>
    );
    fireEvent.change(screen.getByLabelText("追加する開催日"), {
      target: { value: "3" },
    });
    fireEvent.click(screen.getByRole("button", { name: "出典を追加" }));
    fireEvent.change(screen.getByLabelText("出典 1 の議案"), {
      target: { value: "0" },
    });
    fireEvent.change(screen.getByLabelText("出典 1 の根拠引用（任意）"), {
      target: { value: "確認した原文" },
    });
    const form = container.querySelector("form");
    if (!form) throw new Error("Missing test form");
    const read = () =>
      JSON.parse(String(new FormData(form).get("source_refs")));
    expect(read()).toEqual([
      { ...selectTopicSource(option, 0), evidence_quote: "確認した原文" },
    ]);
    expect(
      screen
        .getByRole("link", { name: "出典の原文を別タブで確認" })
        .getAttribute("href")
    ).toBe("/minutes/1/sessions/3");
    fireEvent.click(screen.getByRole("button", { name: "出典 1 を外す" }));
    expect(read()).toEqual([]);
  });
  it("shows missing references instead of silently clearing them", () => {
    const { container } = render(
      <form>
        <TopicSourceFields initial={[selectTopicSource(option)]} options={[]} />
      </form>
    );
    expect(screen.getByRole("alert").textContent).toContain("見つかりません");
    const form = container.querySelector("form");
    if (!form) throw new Error("Missing test form");
    expect(
      JSON.parse(String(new FormData(form).get("source_refs")))
    ).toHaveLength(1);
  });
});
