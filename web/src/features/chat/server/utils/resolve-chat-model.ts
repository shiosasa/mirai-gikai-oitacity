import { openai } from "@ai-sdk/openai";
import type { LanguageModel } from "ai";
import { AI_MODELS } from "@/lib/ai/models";

/**
 * 環境変数に応じたチャット用言語モデルを解決する
 *
 * 優先順位:
 * 1. 外部注入されたモデル（テスト・モック用）
 * 2. Vercel AI Gateway (AI_GATEWAY_API_KEY がある場合)
 * 3. OpenAI API (OPENAI_API_KEY がある場合)
 * 4. デフォルト (AI_MODELS.gpt4o)
 */
export function resolveChatModel(customModel?: LanguageModel): {
  model: LanguageModel | string;
  modelName: string;
} {
  if (customModel) {
    const modelId =
      typeof customModel === "object" &&
      customModel !== null &&
      "modelId" in customModel &&
      typeof customModel.modelId === "string"
        ? customModel.modelId
        : "custom-model";
    return {
      model: customModel,
      modelName: modelId,
    };
  }

  // Vercel AI Gateway が利用可能な場合
  if (process.env.AI_GATEWAY_API_KEY) {
    return {
      model: AI_MODELS.gpt4o,
      modelName: AI_MODELS.gpt4o,
    };
  }

  // 通常の OpenAI API キーが設定されている場合
  if (process.env.OPENAI_API_KEY) {
    return {
      model: openai("gpt-4o"),
      modelName: "openai/gpt-4o",
    };
  }

  // いずれも未検出の場合は警告を出力しつつデフォルト
  console.warn(
    "[Chat AI Model] Neither AI_GATEWAY_API_KEY nor OPENAI_API_KEY is detected in environment variables."
  );
  return {
    model: AI_MODELS.gpt4o,
    modelName: AI_MODELS.gpt4o,
  };
}
