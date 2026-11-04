import "server-only";
import { getPoliticianSpeechMode } from "@mirai-gikai/shared/politicians/speech-mode";
import {
  buildPublishedSpeechHighlights,
  getSampleSpeechHighlights,
  parseSpeechPreviewSamples,
} from "../../shared/utils/speech-highlights";
import { findPublishedSpeechHighlights } from "../repositories/speech-highlight-repository";

export async function getPoliticianSpeechHighlights(politicianId: string) {
  const mode = getPoliticianSpeechMode(process.env);
  if (mode === "disabled") {
    return { highlights: [], invalidCount: 0, isPreview: false };
  }
  if (mode === "preview") {
    return {
      highlights: getSampleSpeechHighlights(
        politicianId,
        parseSpeechPreviewSamples(process.env.POLITICIAN_SPEECH_PREVIEW_JSON)
      ),
      invalidCount: 0,
      isPreview: true,
    };
  }

  const rows = await findPublishedSpeechHighlights(politicianId);
  const { highlights, invalidSources } = buildPublishedSpeechHighlights(rows);
  for (const source of invalidSources) {
    console.error("議員の発言の出典を確認できませんでした", source);
  }
  return { highlights, invalidCount: invalidSources.length, isPreview: false };
}
