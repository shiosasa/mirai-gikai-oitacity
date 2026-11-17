// @vitest-environment jsdom

import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
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
import type {
  MayorProfileInput,
  MayorProfileRecord,
} from "../../shared/utils/mayor-profile";
import { MayorProfileForm } from "./mayor-profile-form";

const mayor: MayorProfileRecord = {
  id: 1,
  name: "確認用市長",
  name_kana: "かくにんようしちょう",
  birth_date: "昭和40年1月1日",
  start_date: "2023-04-17",
  term_number: 1,
  image_url: "https://example.com/photo.jpg",
  official_url: "https://www.city.oita.oita.jp/",
  bio: "「確認用方針」を基本方針とし、「A」「B」「C」「D」「E」の5つの柱。",
};
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

function confirmPreview() {
  fireEvent.click(screen.getByRole("button", { name: "保存前に表示を確認" }));
  fireEvent.click(screen.getByRole("checkbox"));
}

describe("MayorProfileForm", () => {
  it("registers a distinct non-current person without inventing appointment dates", async () => {
    const calls: MayorProfileInput[] = [];
    render(
      <MayorProfileForm
        initial={{
          ...mayor,
          id: 0,
          name: "",
          start_date: null,
          term_number: null,
        }}
        onSave={async (input) => {
          calls.push(input);
          return { data: { id: 99, ...input.content } };
        }}
      />
    );
    fireEvent.change(screen.getByLabelText("氏名"), {
      target: { value: "後任の確認用人物" },
    });
    expect(screen.getByLabelText<HTMLInputElement>("就任日").readOnly).toBe(
      true
    );
    expect(screen.getByLabelText<HTMLInputElement>("期数").readOnly).toBe(true);
    confirmPreview();
    fireEvent.click(
      screen.getByRole("button", { name: "人物を登録（就任は別途）" })
    );
    await waitFor(() => expect(calls).toHaveLength(1));
    expect(calls[0].id).toBeUndefined();
    expect(calls[0].content.start_date).toBeNull();
    expect(calls[0].content.term_number).toBeNull();
    expect(screen.getByRole("status").textContent).toContain("就任を登録");
  });
  it("loads all fields and previews public pillars without saving", () => {
    render(
      <MayorProfileForm
        initial={mayor}
        onSave={async () => {
          throw new Error("Must not save");
        }}
      />
    );
    expect(screen.getByLabelText<HTMLInputElement>("生年月日").value).toBe(
      "昭和40年1月1日"
    );
    expect(screen.getByLabelText<HTMLInputElement>("就任日").value).toBe(
      "2023-04-17"
    );
    expect(
      screen.getByLabelText<HTMLInputElement>("公式の市長室URL").value
    ).toBe(mayor.official_url);
    fireEvent.click(screen.getByRole("button", { name: "保存前に表示を確認" }));
    const preview = screen.getByRole("region", {
      name: "保存前の市長プロフィール",
    });
    expect(
      within(preview).getByRole("heading", { name: mayor.name ?? "" })
    ).toBeTruthy();
    expect(within(preview).getByRole("link").getAttribute("href")).toBe(
      mayor.official_url
    );
    const policy = within(preview).getByRole("region", {
      name: "一覧カードの政策表示",
    });
    expect(within(policy).getAllByRole("listitem")).toHaveLength(5);
    expect(
      screen.getByRole<HTMLButtonElement>("button", {
        name: "変更を保存して公開",
      }).disabled
    ).toBe(true);
  });

  it("invalidates confirmation on edit and warns if the policy text no longer yields pillars", () => {
    render(<MayorProfileForm initial={mayor} onSave={async () => ({})} />);
    confirmPreview();
    expect(
      screen.getByRole<HTMLButtonElement>("button", {
        name: "変更を保存して公開",
      }).disabled
    ).toBe(false);
    fireEvent.change(screen.getByLabelText("紹介文・経歴・基本方針"), {
      target: { value: "経歴だけです。" },
    });
    expect(
      screen.queryByRole("region", { name: "保存前の市長プロフィール" })
    ).toBeNull();
    expect(
      screen.getByRole<HTMLButtonElement>("button", {
        name: "変更を保存して公開",
      }).disabled
    ).toBe(true);
    fireEvent.click(screen.getByRole("button", { name: "保存前に表示を確認" }));
    expect(screen.getByText(/一覧カードには柱を表示しません/)).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "変更を取り消す" }));
    expect(
      screen.getByLabelText<HTMLTextAreaElement>("紹介文・経歴・基本方針").value
    ).toBe(mayor.bio);
  });

  it("saves only editable content under the original ID and retains saved data after reset", async () => {
    const calls: MayorProfileInput[] = [];
    render(
      <MayorProfileForm
        initial={mayor}
        onSave={async (input) => {
          calls.push(input);
          return {
            data: { id: input.id ?? 1, ...input.content },
            warning: "保存済みですがキャッシュ更新に失敗しました",
          };
        }}
      />
    );
    fireEvent.change(screen.getByLabelText("氏名"), {
      target: { value: "変更後の確認用市長" },
    });
    fireEvent.change(screen.getByLabelText("期数"), { target: { value: "" } });
    confirmPreview();
    fireEvent.click(screen.getByRole("button", { name: "変更を保存して公開" }));
    await waitFor(() => expect(calls).toHaveLength(1));
    expect(calls[0].id).toBe(mayor.id);
    expect(calls[0].content.name).toBe("変更後の確認用市長");
    expect(calls[0].content.term_number).toBeNull();
    expect(calls[0].content).not.toHaveProperty("is_current");
    expect(screen.getByRole("status").textContent).toContain("保存しました");
    expect(screen.getByRole("alert").textContent).toContain("キャッシュ更新");
    fireEvent.change(screen.getByLabelText("氏名"), {
      target: { value: "未保存" },
    });
    fireEvent.click(screen.getByRole("button", { name: "変更を取り消す" }));
    expect(screen.getByLabelText<HTMLInputElement>("氏名").value).toBe(
      "変更後の確認用市長"
    );
  });

  it("retains edits after an explicit save failure", async () => {
    render(
      <MayorProfileForm
        initial={mayor}
        onSave={async () => ({ error: "現職ではなくなりました" })}
      />
    );
    fireEvent.change(screen.getByLabelText("氏名"), {
      target: { value: "未保存の編集" },
    });
    confirmPreview();
    fireEvent.click(screen.getByRole("button", { name: "変更を保存して公開" }));
    await waitFor(() =>
      expect(screen.getByRole("alert").textContent).toContain(
        "現職ではなくなりました"
      )
    );
    expect(screen.getByLabelText<HTMLInputElement>("氏名").value).toBe(
      "未保存の編集"
    );
  });

  it("rejects unsafe URLs before previewing", () => {
    render(<MayorProfileForm initial={mayor} onSave={async () => ({})} />);
    fireEvent.change(screen.getByLabelText("公式の市長室URL"), {
      target: { value: "javascript:alert(1)" },
    });
    fireEvent.click(screen.getByRole("button", { name: "保存前に表示を確認" }));
    expect(screen.getByRole("alert").textContent).toContain("URL");
    expect(
      screen.queryByRole("region", { name: "保存前の市長プロフィール" })
    ).toBeNull();
  });
});
