import type { Database } from "@mirai-gikai/supabase";

export type SpeechRecord =
  Database["public"]["Tables"]["politician_speech_highlights"]["Row"];

export type SpeechPolitician = { id: string; name: string };

export type SpeechSession = {
  id: number;
  meetingId: number;
  meetingType: "本会議" | "委員会";
  meetingTitle: string;
  sessionTitle: string | null;
  date: string;
};

export type SpeechSessionRow = {
  id: number;
  meeting_id: number | null;
  session_title: string | null;
  date: string | null;
  meetings: {
    id: number;
    title: string | null;
    meeting_type: string | null;
  } | null;
};

export type SpeechSessionContent = SpeechSessionRow & {
  content: string | null;
  attendees: unknown;
};
