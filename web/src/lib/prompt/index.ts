import { getDefaultPrompt } from "./default-prompts";
import type { PromptProvider } from "./interface/prompt-provider";
import type { CompiledPrompt, PromptVariables } from "./interface/types";
import { getLangfuseClient } from "./langfuse/client";
import { LangfusePromptProvider } from "./langfuse/langfuse-prompt-provider";

class FallbackPromptProvider implements PromptProvider {
  async getPrompt(
    name: string,
    variables?: PromptVariables
  ): Promise<CompiledPrompt> {
    return getDefaultPrompt(name, variables);
  }
}

/**
 * プロンプトプロバイダーの作成処理
 *
 * Langfuse設定がある場合はLangfusePromptProviderを、
 * 未設定または初期化エラーの場合は内蔵デフォルトプロンプト（FallbackPromptProvider）を使用。
 */
export function createPromptProvider(): PromptProvider {
  try {
    const client = getLangfuseClient();
    return new LangfusePromptProvider(client);
  } catch (error) {
    console.warn(
      "Langfuse not available, using built-in default prompt provider:",
      error instanceof Error ? error.message : String(error)
    );
    return new FallbackPromptProvider();
  }
}

export type { PromptProvider } from "./interface/prompt-provider";
export type { CompiledPrompt, PromptVariables } from "./interface/types";
