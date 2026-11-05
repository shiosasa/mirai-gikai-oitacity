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
import {
  getPoliticianProfileFormValues,
  type PoliticianProfileInput,
  parsePoliticianProfileForm,
} from "../../shared/utils/politician-profile";
import { PoliticianManager } from "./politician-manager";

afterEach(cleanup);
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
afterAll(() => vi.unstubAllGlobals());
const parsed = parsePoliticianProfileForm(
  {
    ...getPoliticianProfileFormValues(),
    name: "確認用議員",
    name_kana: "かくにんようぎいん",
    number: "12",
    election_count: "3",
    faction: "確認用会派",
    standing_committee: "文教常任委員会（委員長）",
    special_committee: "確認特別委員会",
    birth_date: "昭和50年4月1日",
    image_url: "https://example.com/photo.jpg",
    homepage: "http://example.com/",
    address: "公式の公開所在地",
    contact: "000-000-0000",
  },
  "00000000-0000-4000-8000-000000000001"
);
if (!parsed.success || !parsed.data.id) throw new Error("Invalid test fixture");
const politician = { ...parsed.data, id: parsed.data.id };

function confirmPreview() {
  fireEvent.click(screen.getByRole("button", { name: "保存前に表示を確認" }));
  fireEvent.click(screen.getByRole("checkbox"));
}

describe("PoliticianManager", () => {
  it("edits all public Oita fields, preserving identity and separate committees", async () => {
    const saved: PoliticianProfileInput[] = [];
    let refreshed = 0;
    render(
      <PoliticianManager
        politicians={[politician]}
        onSave={async (input) => {
          saved.push(input);
          return { data: { id: politician.id } };
        }}
        onRefresh={() => refreshed++}
        scrollToForm={() => {}}
      />
    );
    fireEvent.click(screen.getByRole("button", { name: "確認用議員を編集" }));
    expect(screen.getByLabelText<HTMLInputElement>("議席番号").value).toBe(
      "12"
    );
    expect(screen.getByLabelText<HTMLInputElement>("常任委員会").value).toBe(
      "文教常任委員会（委員長）"
    );
    expect(screen.getByLabelText<HTMLInputElement>("特別委員会").value).toBe(
      "確認特別委員会"
    );
    fireEvent.change(screen.getByLabelText("所属会派"), {
      target: { value: "新しい会派" },
    });
    confirmPreview();
    const preview = screen.getByRole("region", { name: "保存前の議員情報" });
    expect(within(preview).getByText("新しい会派")).toBeTruthy();
    expect(saved).toHaveLength(0);
    fireEvent.click(screen.getByRole("button", { name: "変更を保存して公開" }));
    await waitFor(() => expect(saved).toHaveLength(1));
    expect(saved[0]).toEqual({ ...politician, faction: "新しい会派" });
    expect(refreshed).toBe(1);
    expect(screen.getByRole("status").textContent).toContain("保存しました");
  });

  it("requires a fresh preview and confirmation after changing input", () => {
    render(
      <PoliticianManager
        politicians={[politician]}
        onSave={async () => {
          throw new Error("Must not save");
        }}
        onRefresh={() => {}}
        scrollToForm={() => {}}
      />
    );
    fireEvent.click(screen.getByRole("button", { name: "確認用議員を編集" }));
    confirmPreview();
    expect(
      screen.getByRole<HTMLButtonElement>("button", {
        name: "変更を保存して公開",
      }).disabled
    ).toBe(false);
    fireEvent.change(screen.getByLabelText("公式サイトURL"), {
      target: { value: "javascript:alert(1)" },
    });
    expect(
      screen.getByRole<HTMLButtonElement>("button", {
        name: "変更を保存して公開",
      }).disabled
    ).toBe(true);
    fireEvent.click(screen.getByRole("button", { name: "保存前に表示を確認" }));
    expect(screen.getByRole("alert").textContent).toContain("URL");
    expect(
      screen.queryByRole("region", { name: "保存前の議員情報" })
    ).toBeNull();
  });

  it("creates a new profile only after explicit public-save confirmation", async () => {
    const saved: PoliticianProfileInput[] = [];
    render(
      <PoliticianManager
        politicians={[]}
        onSave={async (input) => {
          saved.push(input);
          return { data: { id: politician.id } };
        }}
        onRefresh={() => {}}
        scrollToForm={() => {}}
      />
    );
    expect(screen.getByText(/下書き・非公開機能はありません/)).toBeTruthy();
    fireEvent.change(screen.getByLabelText("氏名"), {
      target: { value: "新規確認議員" },
    });
    fireEvent.change(screen.getByLabelText("議席番号"), {
      target: { value: "44" },
    });
    confirmPreview();
    fireEvent.click(screen.getByRole("button", { name: "議員を登録して公開" }));
    await waitFor(() => expect(saved).toHaveLength(1));
    expect(saved[0].id).toBeUndefined();
    expect(saved[0].number).toBe(44);
    expect(saved[0].election_count).toBeNull();
    expect(saved[0].standing_committee).toBeNull();
  });

  it("shows failed saves without clearing edits, and warns about stale public caches", async () => {
    let attempts = 0;
    render(
      <PoliticianManager
        politicians={[politician]}
        onSave={async () => {
          attempts++;
          return attempts === 1
            ? { error: "保存に失敗しました" }
            : {
                data: { id: politician.id },
                warning: "保存済みですがキャッシュ更新に失敗しました",
              };
        }}
        onRefresh={() => {}}
        scrollToForm={() => {}}
      />
    );
    fireEvent.click(screen.getByRole("button", { name: "確認用議員を編集" }));
    confirmPreview();
    fireEvent.click(screen.getByRole("button", { name: "変更を保存して公開" }));
    await waitFor(() =>
      expect(screen.getByRole("alert").textContent).toContain("保存に失敗")
    );
    expect(screen.getByLabelText<HTMLInputElement>("氏名").value).toBe(
      politician.name
    );
    fireEvent.click(screen.getByRole("button", { name: "変更を保存して公開" }));
    await waitFor(() =>
      expect(screen.getByRole("alert").textContent).toContain("キャッシュ更新")
    );
    expect(screen.getByRole("status").textContent).toContain("保存しました");
  });
});
