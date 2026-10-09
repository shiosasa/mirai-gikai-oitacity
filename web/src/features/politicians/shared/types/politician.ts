export type Politician = {
  id: string;
  name: string;
  name_kana: string;
  birth_date: string | null;
  election_count: number | null;
  faction: string | null;
  standing_committee: string | null;
  special_committee: string | null;
  address: string | null;
  contact: string | null;
  homepage: string | null;
  image_url: string | null;
  slug: string | null;
  created_at: string;
  number: number | null;
};
