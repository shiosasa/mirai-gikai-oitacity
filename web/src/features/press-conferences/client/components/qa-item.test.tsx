// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import type { PressConferenceItem } from "../../shared/types";
import { QaItem } from "./qa-item";

const item: PressConferenceItem = {
  id: "qa-1",
  itemType: "qa",
  orderIndex: 0,
  title: "復興について",
  summary: "市長が復興の方針を説明しました。",
  materialUrl: null,
  detail: null,
  turns: [
    {
      id: "reporter-1",
      speaker: "reporter",
      speakerName: null,
      content: "復興の進め方は？",
      orderIndex: 0,
    },
    {
      id: "mayor-1",
      speaker: "governor",
      speakerName: null,
      content: "地域の意見を聞きながら進めます。",
      orderIndex: 1,
    },
  ],
};

afterEach(cleanup);

describe("QaItem", () => {
  it("opens and closes the summary and existing conversation", () => {
    render(<QaItem item={item} />);
    const toggle = screen.getByRole("button", { name: /復興について/ });

    expect(toggle.getAttribute("aria-expanded")).toBe("false");
    expect(screen.queryByText(item.summary ?? "")).toBeNull();

    fireEvent.click(toggle);
    expect(toggle.getAttribute("aria-expanded")).toBe("true");
    expect(screen.getByText(item.summary ?? "")).toBeTruthy();
    expect(screen.getByText("記者")).toBeTruthy();
    expect(screen.getByText("市長")).toBeTruthy();
    expect(screen.getByText("地域の意見を聞きながら進めます。")).toBeTruthy();

    fireEvent.click(toggle);
    expect(toggle.getAttribute("aria-expanded")).toBe("false");
    expect(screen.queryByText(item.summary ?? "")).toBeNull();
  });

  it("shows a preparation message only when summary and turns are absent", () => {
    const { rerender } = render(
      <QaItem item={{ ...item, summary: null, turns: [] }} defaultOpen />
    );
    expect(screen.getByText("質疑の内容は準備中です。")).toBeTruthy();

    rerender(<QaItem item={{ ...item, summary: null }} defaultOpen />);
    expect(screen.queryByText("質疑の内容は準備中です。")).toBeNull();
    expect(screen.getByText("復興の進め方は？")).toBeTruthy();
  });
});
