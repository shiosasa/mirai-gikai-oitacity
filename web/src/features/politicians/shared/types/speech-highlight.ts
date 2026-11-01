export type SpeechHighlight = {
  id: string;
  title: string;
  quote: string;
  context: string | null;
  meetingId: number;
  sessionId: number;
  meetingType: "本会議" | "委員会";
  meetingTitle: string;
  meetingDate: string;
};

export type PoliticianDiscussion = {
  id: string;
  question_summary: string | null;
  source_url: string | null;
  bills: { id: string; name: string } | null;
};
