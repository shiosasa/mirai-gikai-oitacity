import "server-only";
import { createAdminClient } from "@mirai-gikai/supabase";

export async function findOfficeTerms() {
  const { data, error } = await createAdminClient()
    .from("office_terms")
    .select("*")
    .order("started_on", { ascending: false, nullsFirst: false })
    .order("id", { ascending: false });
  if (error) throw new Error(`Failed to fetch office terms: ${error.message}`);
  return data;
}

export async function findFormerOfficeHolders() {
  const db = createAdminClient();
  const [terms, mayors, politicians] = await Promise.all([
    findOfficeTerms(),
    db
      .from("mayor_profile")
      .select("id,name,is_current")
      .eq("is_current", false),
    db
      .from("politicians")
      .select("id,name,is_current")
      .eq("is_current", false)
      .neq("name", "欠番")
      .order("name_kana"),
  ]);
  if (mayors.error || politicians.error)
    throw new Error(
      `Failed to fetch former office holders: ${mayors.error?.message ?? politicians.error?.message}`
    );
  return {
    terms,
    mayors: mayors.data.filter((person) =>
      terms.some(
        (term) => term.mayor_id === person.id && term.ended_on !== null
      )
    ),
    politicians: politicians.data.filter((person) =>
      terms.some(
        (term) => term.politician_id === person.id && term.ended_on !== null
      )
    ),
  };
}

export async function findHistoricalMayor(id: number) {
  const { data, error } = await createAdminClient()
    .from("mayor_profile")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error)
    throw new Error(`Failed to fetch historical mayor: ${error.message}`);
  return data;
}
