// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { OITA_PROTOTYPE_QUESTIONS } from "../_lib/oita-prototype-helpers";
import { OitaPrototypeClient } from "./oita-prototype-client";

afterEach(cleanup);

describe("OitaPrototypeClient", () => {
  it("shows list cards first and opens one-on-one chat view on click", () => {
    render(<OitaPrototypeClient questions={OITA_PROTOTYPE_QUESTIONS} />);

    // 初期状態は一覧のみ表示され、詳細の戻るボタンは表示されない
    expect(
      screen.queryByRole("button", { name: /質問者一覧に戻る/ })
    ).toBeNull();
    expect(screen.getByText("サンプル議員 A")).toBeTruthy();

    // カードをクリックすると一問一答詳細へ切り替わる（初期表示はAI要約）
    fireEvent.click(screen.getByRole("button", { name: /サンプル議員 A/ }));
    expect(
      screen.getByRole("button", { name: /質問者一覧に戻る/ })
    ).toBeTruthy();
    expect(screen.getByText("福祉避難所の開設手順と要配慮者支援")).toBeTruthy();
    expect(
      screen.getByText(/指定避難所から福祉避難所への移動に時間がかかる/)
    ).toBeTruthy();

    // 会議録イメージに切り替えたあと一覧へ戻り、再度開くとAI要約に戻る
    fireEvent.click(screen.getByRole("button", { name: "会議録イメージ" }));
    expect(
      screen.getByText(/大規模災害の際、高齢者や障がいのある方が/)
    ).toBeTruthy();

    // 戻るボタンで一覧に戻る
    fireEvent.click(screen.getByRole("button", { name: /質問者一覧に戻る/ }));
    expect(
      screen.queryByRole("button", { name: /質問者一覧に戻る/ })
    ).toBeNull();
    expect(screen.getByText("サンプル議員 B")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: /サンプル議員 B/ }));
    expect(
      screen.getByText(/朝一番に電話が繋がらないという保護者の声が多い/)
    ).toBeTruthy();
  });
});
