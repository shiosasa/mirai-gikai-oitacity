// @vitest-environment jsdom

import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import type { SpeechRecord, SpeechSession } from "../../shared/types/speech";
import type { SpeechInput } from "../../shared/utils/speech-input";
import { SpeechManager } from "./speech-manager";

const politicianId = "00000000-0000-4000-8000-000000000001";
const session: SpeechSession = {
  id: 28,
  meetingId: 4,
  meetingType: "委員会",
  meetingTitle: "見本委員会",
  sessionTitle: "第1日",
  date: "2026-06-24",
};
const entry: SpeechRecord = {
  id: "00000000-0000-4000-8000-000000000003",
  politician_id: politicianId,
  meeting_session_id: 28,
  title: "登録済みの見出し",
  quote: "議事録からの引用です。",
  context: "登録済みの補足です。",
  is_published: true,
  created_at: "2026-06-24T00:00:00Z",
  updated_at: "2026-06-24T00:00:00Z",
};

function renderManager(options: { error?: string; confirmed?: boolean } = {}) {
  const calls = {
    saves: [] as SpeechInput[],
    unpublished: [] as string[],
    confirms: [] as string[],
    refreshes: 0,
    scrolls: 0,
  };
  render(
    <SpeechManager
      entries={[entry]}
      politicians={[{ id: politicianId, name: "見本 太郎" }]}
      sessions={[session]}
      webUrl="https://example.com"
      onSave={async (input) => {
        calls.saves.push(input);
        return { error: options.error ?? null };
      }}
      onUnpublish={async (id) => {
        calls.unpublished.push(id);
        return { error: null };
      }}
      onRefresh={() => {
        calls.refreshes += 1;
      }}
      confirm={(message) => {
        calls.confirms.push(message);
        return options.confirmed ?? true;
      }}
      scrollToForm={() => {
        calls.scrolls += 1;
      }}
    />
  );
  return calls;
}

function fillForm() {
  fireEvent.change(screen.getByLabelText("議員"), {
    target: { value: politicianId },
  });
  fireEvent.change(screen.getByLabelText("出典の議事録"), {
    target: { value: "28" },
  });
  fireEvent.change(screen.getByLabelText("見出し"), {
    target: { value: "新しい見出し" },
  });
  fireEvent.change(screen.getByLabelText("発言の引用"), {
    target: { value: "議事録の引用。" },
  });
  fireEvent.change(screen.getByLabelText("補足（任意）"), {
    target: { value: "議題についての説明です。" },
  });
}

beforeAll(() => {
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
  );
});
afterEach(cleanup);
afterAll(() => vi.unstubAllGlobals());

describe("SpeechManager", () => {
  it("saves a draft without publishing and shows a source link and preview", async () => {
    const calls = renderManager();
    fillForm();
    expect(screen.getByText("見え方の確認（管理画面内）")).toBeTruthy();
    expect(screen.getByText("補足：議題についての説明です。")).toBeTruthy();
    expect(
      screen
        .getByRole("link", { name: "選択した議事録を開く" })
        .getAttribute("href")
    ).toBe("https://example.com/committees/committee/4/28");
    fireEvent.click(screen.getByRole("button", { name: "下書きを保存" }));
    await waitFor(() => expect(calls.saves).toHaveLength(1));
    expect(calls.saves[0]).toMatchObject({
      politicianId,
      sessionId: 28,
      title: "新しい見出し",
      context: "議題についての説明です。",
      isPublished: false,
      speakerConfirmed: false,
    });
    await waitFor(() => expect(calls.refreshes).toBe(1));
    expect((screen.getByLabelText("見出し") as HTMLInputElement).value).toBe(
      ""
    );
  });

  it("requires re-confirmation after editing and asks before publication", async () => {
    const calls = renderManager();
    fillForm();
    fireEvent.click(
      screen.getByRole("checkbox", { name: "この発言を公開する" })
    );
    const verified = screen.getByRole("checkbox", {
      name: "議事録で議員本人の発言と前後の文脈を確認しました",
    });
    fireEvent.click(verified);
    expect(verified.getAttribute("aria-checked")).toBe("true");
    fireEvent.change(screen.getByLabelText("補足（任意）"), {
      target: { value: "変更した補足" },
    });
    expect(verified.getAttribute("aria-checked")).toBe("false");
    fireEvent.click(screen.getByRole("button", { name: "確認して公開" }));
    expect(calls.saves).toHaveLength(0);
    fireEvent.click(verified);
    fireEvent.click(screen.getByRole("button", { name: "確認して公開" }));
    await waitFor(() => expect(calls.saves).toHaveLength(1));
    expect(calls.saves[0]).toMatchObject({
      context: "変更した補足",
      isPublished: true,
      speakerConfirmed: true,
    });
    expect(calls.confirms).toHaveLength(1);
  });

  it("does not save when the publication confirmation is cancelled", () => {
    const calls = renderManager({ confirmed: false });
    fillForm();
    fireEvent.click(
      screen.getByRole("checkbox", { name: "この発言を公開する" })
    );
    fireEvent.click(
      screen.getByRole("checkbox", {
        name: "議事録で議員本人の発言と前後の文脈を確認しました",
      })
    );
    fireEvent.click(screen.getByRole("button", { name: "確認して公開" }));
    expect(calls.confirms).toHaveLength(1);
    expect(calls.saves).toHaveLength(0);
  });

  it("loads an existing record for editing and can unpublish it", async () => {
    const calls = renderManager();
    fireEvent.click(screen.getByRole("button", { name: "編集" }));
    expect(calls.scrolls).toBe(1);
    expect((screen.getByLabelText("見出し") as HTMLInputElement).value).toBe(
      entry.title
    );
    expect(
      (screen.getByLabelText("補足（任意）") as HTMLTextAreaElement).value
    ).toBe(entry.context);
    fireEvent.click(screen.getByRole("button", { name: "非公開にする" }));
    await waitFor(() => expect(calls.unpublished).toEqual([entry.id]));
    await waitFor(() => expect(calls.refreshes).toBe(1));
    expect((screen.getByLabelText("見出し") as HTMLInputElement).value).toBe(
      ""
    );
  });

  it("keeps the form contents when the server rejects the save", async () => {
    const calls = renderManager({ error: "引用が原文と一致しません" });
    fillForm();
    fireEvent.click(screen.getByRole("button", { name: "下書きを保存" }));
    await waitFor(() => expect(calls.saves).toHaveLength(1));
    expect(calls.refreshes).toBe(0);
    expect((screen.getByLabelText("見出し") as HTMLInputElement).value).toBe(
      "新しい見出し"
    );
  });
});
