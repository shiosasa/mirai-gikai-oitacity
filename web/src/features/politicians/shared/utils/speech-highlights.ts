import { validateSpeechQuote } from "@mirai-gikai/shared/politicians/speech-quote";
import { z } from "zod";
import type { SpeechHighlight } from "../types/speech-highlight";

const speechPreviewSampleSchema = z.object({
  id: z.string().min(1),
  politician_id: z.string().min(1),
  politician_name: z.string().min(1),
  meeting_session_id: z.number().int().positive(),
  meeting_id: z.number().int().positive(),
  meeting_type: z.enum(["本会議", "委員会"]),
  meeting_title: z.string().min(1),
  meeting_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  title: z.string().min(1),
  quote: z.string().min(1),
  context: z.string().nullable(),
  approved: z.boolean(),
});

type SpeechPreviewSample = z.infer<typeof speechPreviewSampleSchema>;

type SpeechSourceRow = {
  id: string;
  title: string;
  quote: string;
  context: string | null;
  meeting_sessions: {
    id: number;
    meeting_id: number | null;
    date: string | null;
    content: string | null;
    meetings: {
      id: number;
      title: string | null;
      meeting_type: string | null;
    } | null;
  } | null;
};

export function parseSpeechPreviewSamples(
  value: string | undefined
): SpeechPreviewSample[] {
  if (!value) {
    throw new Error("POLITICIAN_SPEECH_PREVIEW_JSON に見本を設定してください");
  }
  const parsed: unknown = JSON.parse(value);
  const samples = z.array(speechPreviewSampleSchema).min(1).parse(parsed);
  if (new Set(samples.map((sample) => sample.id)).size !== samples.length) {
    throw new Error("見本のIDが重複しています");
  }
  return samples;
}

export function sortSpeechHighlights(
  highlights: SpeechHighlight[]
): SpeechHighlight[] {
  return [...highlights].sort(
    (a, b) =>
      b.meetingDate.localeCompare(a.meetingDate) || a.id.localeCompare(b.id)
  );
}

export function getSampleSpeechHighlights(
  politicianId: string,
  samples: SpeechPreviewSample[]
): SpeechHighlight[] {
  return sortSpeechHighlights(
    samples
      .filter((sample) => sample.politician_id === politicianId)
      .map((sample) => ({
        id: sample.id,
        title: sample.title,
        quote: sample.quote,
        context: sample.context,
        meetingId: sample.meeting_id,
        sessionId: sample.meeting_session_id,
        meetingType: sample.meeting_type,
        meetingTitle: sample.meeting_title,
        meetingDate: sample.meeting_date,
      }))
  );
}

export function buildPublishedSpeechHighlights(rows: SpeechSourceRow[]) {
  const highlights: SpeechHighlight[] = [];
  const invalidSources: { id: string; reason: string }[] = [];

  for (const row of rows) {
    const session = row.meeting_sessions;
    const meeting = session?.meetings;
    const quoteError = validateSpeechQuote(session?.content ?? null, row.quote);
    if (
      !session ||
      session.meeting_id === null ||
      !session.date ||
      !meeting?.title ||
      meeting.id !== session.meeting_id ||
      (meeting.meeting_type !== "本会議" &&
        meeting.meeting_type !== "委員会") ||
      quoteError
    ) {
      invalidSources.push({
        id: row.id,
        reason: quoteError ?? "会議の情報が不完全です",
      });
      continue;
    }
    highlights.push({
      id: row.id,
      title: row.title,
      quote: row.quote,
      context: row.context,
      meetingId: session.meeting_id,
      sessionId: session.id,
      meetingType: meeting.meeting_type,
      meetingTitle: meeting.title,
      meetingDate: session.date,
    });
  }

  return { highlights: sortSpeechHighlights(highlights), invalidSources };
}
