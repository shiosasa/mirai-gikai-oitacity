import "server-only";
import { createAdminClient } from "@mirai-gikai/supabase";
import type {
  OfficeChangeInput,
  OfficePerson,
} from "../../shared/utils/office-change";

export async function loadOfficeHistory() {
  const db = createAdminClient();
  const [politicians, mayors, terms] = await Promise.all([
    db
      .from("politicians")
      .select("id,name,is_current")
      .neq("name", "欠番")
      .order("name"),
    db.from("mayor_profile").select("id,name,is_current").order("id"),
    db
      .from("office_terms")
      .select("*")
      .order("started_on", { ascending: false, nullsFirst: false })
      .order("id", { ascending: false }),
  ]);
  if (politicians.error || mayors.error || terms.error) {
    throw new Error(
      `任期履歴を取得できません: ${politicians.error?.message ?? mayors.error?.message ?? terms.error?.message}。必要なDB更新が適用されているか確認してください。`
    );
  }
  const people: OfficePerson[] = [
    ...mayors.data.map((person) => ({
      id: String(person.id),
      name: person.name ?? "氏名未設定",
      role: "mayor" as const,
      isCurrent: person.is_current === true,
    })),
    ...politicians.data.map((person) => ({
      id: person.id,
      name: person.name,
      role: "councillor" as const,
      isCurrent: person.is_current,
    })),
  ];
  return { people, terms: terms.data };
}

export async function changeOffice(input: OfficeChangeInput) {
  const { data, error } = await createAdminClient().rpc("change_office_term", {
    p_role: input.role,
    p_person_id: input.personId,
    p_action: input.action,
    p_expected_term: input.expectedTerm,
    p_started_on: input.startedOn,
    p_ended_on: input.endedOn,
    p_successor_id: input.successorId,
    p_seat_number: input.seatNumber,
    p_term_number: input.termNumber,
    p_source_url: input.sourceUrl,
  });
  if (error) throw new Error(`任期の変更に失敗しました: ${error.message}`);
  return data;
}
