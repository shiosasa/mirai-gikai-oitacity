import type { LanguageModel } from "ai";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { resolveChatModel } from "./resolve-chat-model";

describe("resolveChatModel", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("customModel が渡された場合はそれが最優先で使用される", () => {
    const fakeModel = {
      modelId: "test-fake-model",
    } as unknown as LanguageModel;
    const { model, modelName } = resolveChatModel(fakeModel);
    expect(model).toBe(fakeModel);
    expect(modelName).toBe("test-fake-model");
  });

  it("AI_GATEWAY_API_KEY がある場合は Gateway 文字列モデルを返す", () => {
    process.env.AI_GATEWAY_API_KEY = "mock-gateway-key";
    delete process.env.OPENAI_API_KEY;

    const { model, modelName } = resolveChatModel();
    expect(model).toBe("openai/gpt-4o");
    expect(modelName).toBe("openai/gpt-4o");
  });

  it("OPENAI_API_KEY のみがある場合は openai モデルインスタンスを返す", () => {
    delete process.env.AI_GATEWAY_API_KEY;
    process.env.OPENAI_API_KEY = "sk-mock-key";

    const { model, modelName } = resolveChatModel();
    expect(typeof model).toBe("object"); // LanguageModel instance
    expect(modelName).toBe("openai/gpt-4o");
  });

  it("キーがない場合でもフォールバックとしてデフォルトモデルを返す", () => {
    delete process.env.AI_GATEWAY_API_KEY;
    delete process.env.OPENAI_API_KEY;

    const { model, modelName } = resolveChatModel();
    expect(model).toBe("openai/gpt-4o");
    expect(modelName).toBe("openai/gpt-4o");
  });
});
