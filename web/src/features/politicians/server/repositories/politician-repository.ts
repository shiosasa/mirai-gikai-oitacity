"server-only";

import { createAdminClient } from "@mirai-gikai/supabase";

export type PoliticianRow = {
  id: string;
  name: string;
  name_kana: string | null;
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
  is_current: boolean;
};

export async function findPublishedPoliticians(): Promise<PoliticianRow[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("politicians")
    .select("*")
    .neq("name", "欠番")
    .eq("is_current", true)
    .order("number", { ascending: true, nullsFirst: false })
    .order("name_kana", { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch politicians: ${error.message}`);
  }

  return data;
}

export async function findRecordedPoliticians(): Promise<PoliticianRow[]> {
  const { data, error } = await createAdminClient()
    .from("politicians")
    .select("*,office_terms!inner(id)")
    .neq("name", "欠番")
    .order("name_kana");
  if (error)
    throw new Error(`Failed to fetch recorded politicians: ${error.message}`);
  return data;
}

export async function findPublishedPoliticianById(
  id: string
): Promise<PoliticianRow | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("politicians")
    .select("*")
    .eq("id", id)
    .neq("name", "欠番")
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch politician: ${error.message}`);
  }

  return data;
}

export async function findPoliticianDiscussions(id: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("bill_discussions")
    .select(
      "id, question_summary, answer_summary, source_url, created_at, bills (id, name)"
    )
    .eq("politician_id", id)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch politician discussions: ${error.message}`);
  }

  return data ?? [];
}

export async function getPoliticiansRepository(): Promise<PoliticianRow[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("politicians")
    .select("*")
    .neq("name", "欠番")
    .eq("is_current", true)
    .order("number", { ascending: true, nullsFirst: false })
    .order("name_kana", { ascending: true });

  if (error) {
    console.error("Failed to fetch politicians:", error);
    return [];
  }

  return data ?? [];
}

export async function getPoliticianByIdRepository(
  id: string
): Promise<PoliticianRow | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("politicians")
    .select("*")
    .eq("id", id)
    .neq("name", "欠番")
    .single();

  if (error || !data) {
    console.error(`Failed to fetch politician with id ${id}:`, error);
    return null;
  }

  return data;
}
