import "server-only";
import { createAdminClient } from "@mirai-gikai/supabase";
import type { MayorProfile, MayorProposal } from "../../shared/types/mayor";

export async function findCurrentMayor(): Promise<
  (MayorProfile & { id: number }) | null
> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("mayor_profile")
    .select(
      "id, name, name_kana, birth_date, image_url, official_url, start_date, term_number, bio"
    )
    .eq("is_current", true)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch current mayor: ${error.message}`);
  }

  return data;
}

export async function findMayorProposals(): Promise<MayorProposal[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("meetings")
    .select("*")
    .not("mayor_proposal_text", "is", null)
    .neq("mayor_proposal_text", "")
    .order("date", { ascending: false, nullsFirst: false });

  if (error) {
    throw new Error(
      `Failed to fetch mayor proposal explanations: ${error.message}`
    );
  }

  if (
    data?.some(
      (row) =>
        !Object.hasOwn(row, "mayor_proposal_summary") ||
        !Object.hasOwn(row, "mayor_proposal_source_url")
    )
  ) {
    console.warn(
      "Mayor proposal summary columns are not available; summaries are shown as pending."
    );
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    title: row.title,
    date: row.date,
    mayor_proposal_summary: row.mayor_proposal_summary ?? null,
    mayor_proposal_source_url: row.mayor_proposal_source_url ?? null,
  }));
}
