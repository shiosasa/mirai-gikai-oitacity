import { z } from "zod";

export const topicSourceSchema = z
  .object({
    session_id: z.number().int().positive(),
    meeting_id: z.number().int().positive(),
    meeting_type: z.string(),
    meeting_title: z.string(),
    session_label: z.string(),
    date: z.string(),
    bill_number: z
      .string()
      .nullable()
      .transform((value) => value || null),
    bill_name: z
      .string()
      .nullable()
      .transform((value) => value || null),
    evidence_quote: z.string().nullable(),
  })
  .catchall(z.json());

export const topicSourcesSchema = z.array(topicSourceSchema);
export type TopicSource = z.infer<typeof topicSourceSchema>;
export type TopicSourceOption = {
  sessionId: number;
  meetingId: number;
  meetingType: string;
  meetingTitle: string;
  sessionLabel: string;
  date: string;
  bills: { number: string | null; name: string }[];
};

export function selectTopicSource(
  option: TopicSourceOption,
  billIndex?: number
): TopicSource {
  const bill = billIndex === undefined ? undefined : option.bills[billIndex];
  if (billIndex !== undefined && !bill) {
    throw new Error("選択した議案が見つかりません。再読み込みしてください");
  }
  return {
    session_id: option.sessionId,
    meeting_id: option.meetingId,
    meeting_type: option.meetingType,
    meeting_title: option.meetingTitle,
    session_label: option.sessionLabel,
    date: option.date,
    bill_number: bill?.number ?? null,
    bill_name: bill?.name ?? null,
    evidence_quote: null,
  };
}

export function validateTopicSources(
  sources: TopicSource[],
  options: TopicSourceOption[]
): TopicSource[] {
  return sources.map((source) => {
    const option = options.find((item) => item.sessionId === source.session_id);
    if (!option || option.meetingId !== source.meeting_id) {
      throw new Error("出典の議事録が見つかりません。出典を選び直してください");
    }
    const billIndex = option.bills.findIndex(
      (bill) =>
        bill.name === source.bill_name && bill.number === source.bill_number
    );
    if (
      (source.bill_name !== null || source.bill_number !== null) &&
      billIndex < 0
    ) {
      throw new Error("出典の議案が変更されています。議案を選び直してください");
    }
    return {
      ...source,
      ...selectTopicSource(option, billIndex >= 0 ? billIndex : undefined),
      evidence_quote: source.evidence_quote,
    };
  });
}
