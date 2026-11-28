export type AdminGeneralQuestionTopic = {
  title: string;
  category?: string | null;
  question_summary: string;
  answer_summary: string;
  answerer_role: string;
  answerer_name: string;
  block_summary?: string | null;
  question_raw_text?: string | null;
  answer_raw_text?: string | null;
};

export type AdminGeneralQuestion = {
  id: string;
  council_session_id: string;
  politician_id: string | null;
  questioner_name: string;
  questioner_party: string | null;
  questioner_number: number | null;
  session_day: number;
  question_order: number;
  summary: string | null;
  topics: AdminGeneralQuestionTopic[];
  raw_text: string | null;
  answer_raw_text: string | null;
  source_url: string | null;
  publish_status: "draft" | "published" | string;
  created_at: string;
  updated_at: string;
};

export type CouncilSessionOption = {
  id: string;
  name: string;
};

export type PoliticianOption = {
  id: string;
  name: string;
  faction: string | null;
  seat_number: number | null;
};
