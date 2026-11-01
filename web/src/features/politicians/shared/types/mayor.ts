import type { Database } from "@mirai-gikai/supabase";

type MayorRow = Database["public"]["Tables"]["mayor_profile"]["Row"];
type MeetingRow = Database["public"]["Tables"]["meetings"]["Row"];

export type MayorProfile = Pick<
  MayorRow,
  | "name"
  | "name_kana"
  | "birth_date"
  | "image_url"
  | "official_url"
  | "start_date"
  | "term_number"
  | "bio"
>;

export type MayorProposal = Pick<
  MeetingRow,
  | "id"
  | "title"
  | "date"
  | "mayor_proposal_summary"
  | "mayor_proposal_source_url"
>;

export type MayorConferenceItem = {
  id: string;
  title: string;
  material_url: string | null;
  order_index: number;
  item_type: string;
  summary: string | null;
};

export type MayorConference = {
  id: string;
  slug: string;
  title: string;
  held_at: string;
  youtube_url: string | null;
  status: string;
  press_conference_items: MayorConferenceItem[];
};
