// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { beforeAll, describe, expect, it } from "vitest";
import { InterviewPublicConsentModal } from "./interview-public-consent-modal";
import { MakePublicModal } from "./make-public-modal";

beforeAll(() => {
  global.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

describe("MakePublicModal", () => {
  it("政党名を前提とした「党内」という表現を含まない", () => {
    render(
      <MakePublicModal
        open={true}
        onOpenChange={() => {}}
        onConfirm={() => {}}
        isSubmitting={false}
      />
    );

    expect(screen.queryByText(/党内/)).not.toBeInTheDocument();
  });

  it("活用文言が余分な空白なく連結されて表示される", () => {
    render(
      <MakePublicModal
        open={true}
        onOpenChange={() => {}}
        onConfirm={() => {}}
        isSubmitting={false}
      />
    );

    expect(
      screen.getByText(
        "非公開で提出した場合でも、ご意見は市政への提言などに活用させていただきます。"
      )
    ).toBeInTheDocument();
  });
});

describe("インタビューの公開範囲の説明", () => {
  const modals = [
    {
      name: "提出時",
      element: (
        <InterviewPublicConsentModal
          open={true}
          onOpenChange={() => {}}
          onSubmit={() => {}}
          isSubmitting={false}
        />
      ),
      privateButton: "非公開で提出する",
    },
    {
      name: "公開への変更時",
      element: (
        <MakePublicModal
          open={true}
          onOpenChange={() => {}}
          onConfirm={() => {}}
          isSubmitting={false}
        />
      ),
      privateButton: "非公開のまま戻る",
    },
  ];

  it.each(modals)("$nameは会話全文の公開時期と個人情報への注意を明示する", ({
    element,
    privateButton,
  }) => {
    render(element);

    expect(
      screen.getByText(
        "会話ログは入力した内容を含めて全文公開されます。記事に採用される前でも、URLを知っている人が閲覧できます。"
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "氏名や住所など、個人を特定できる情報が含まれる場合は、非公開をお選びください。"
      )
    ).toBeInTheDocument();
    expect(screen.getByRole("dialog")).toHaveAccessibleDescription(
      /会話ログは入力した内容を含めて全文公開されます/
    );
    expect(
      screen.getByRole("button", { name: privateButton })
    ).toBeInTheDocument();
  });
});
