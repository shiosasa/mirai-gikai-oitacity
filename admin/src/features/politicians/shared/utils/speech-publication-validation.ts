import { validateSpeechQuote } from "@mirai-gikai/shared/politicians/speech-quote";
import { identifySpeechSpeaker } from "@mirai-gikai/shared/politicians/speech-speaker";
import type { SpeechPolitician, SpeechSessionContent } from "../types/speech";
import type { SpeechInput } from "./speech-input";
import { buildSpeechSessionOptions } from "./speech-session-options";

export function validateSpeechPublication(
  input: SpeechInput,
  session: SpeechSessionContent | null,
  politicians: SpeechPolitician[]
): string | null {
  if (!input.speakerConfirmed) {
    return "公開前に、議員本人の発言と前後の文脈を確認してください";
  }
  if (
    !session ||
    session.id !== input.sessionId ||
    buildSpeechSessionOptions([session]).sessions.length !== 1
  ) {
    return "選択した議事録の会議情報を確認できません";
  }
  const quoteError = validateSpeechQuote(session.content, input.quote);
  if (quoteError) return quoteError;
  if (!session.content) return "選択した議事録に原文がありません";

  const speaker = identifySpeechSpeaker(
    session.content,
    input.quote,
    politicians,
    session.attendees
  );
  if (speaker.kind === "matched" && speaker.id !== input.politicianId) {
    return `議事録の発言者（${speaker.label}）と選択した議員が一致しません`;
  }
  return null;
}
