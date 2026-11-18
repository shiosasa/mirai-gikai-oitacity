import type { Langfuse } from "langfuse";
import { env } from "@/lib/env";
import { getDefaultPrompt } from "../default-prompts";
import type { PromptProvider } from "../interface/prompt-provider";
import type { CompiledPrompt, PromptVariables } from "../interface/types";
import { compilePrompt } from "../shared/compile-prompt";

const FALLBACK_LABEL = "production";

export class LangfusePromptProvider implements PromptProvider {
  constructor(private client: Langfuse) {}

  async getPrompt(
    name: string,
    variables?: PromptVariables
  ): Promise<CompiledPrompt> {
    try {
      const fetchedPrompt = await this.fetchPromptWithFallback(name);
      return compilePrompt(fetchedPrompt, variables);
    } catch (error) {
      console.warn(
        `[Langfuse] Failed to fetch prompt "${name}", falling back to default built-in prompt:`,
        error
      );
      return getDefaultPrompt(name, variables);
    }
  }

  private async fetchPromptWithFallback(name: string) {
    const primaryLabel = env.langfuse.promptLabel;

    try {
      return await this.client.getPrompt(name, undefined, {
        label: primaryLabel,
      });
    } catch (error) {
      if (primaryLabel === FALLBACK_LABEL) {
        throw error;
      }

      console.warn(
        `[Langfuse] Prompt "${name}" not found with label "${primaryLabel}", falling back to "${FALLBACK_LABEL}": ${error instanceof Error ? error.message : String(error)}`
      );
      return await this.client.getPrompt(name, undefined, {
        label: FALLBACK_LABEL,
      });
    }
  }
}
