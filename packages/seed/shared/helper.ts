import { createClient } from "@supabase/supabase-js";
import type { Database } from "@mirai-gikai/supabase";
import { assertLocalSeedResetAllowed } from "./assert-local-seed-reset";

export type AdminClient = ReturnType<typeof createAdminClient>;

export function createAdminClient() {
  return createClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

const TABLES_TO_CLEAR = [
  "interview_report",
  "interview_messages",
  "interview_sessions",
  "interview_questions",
  "interview_configs",
  "politicians",
  "faction_stances",
  "chats",
  "bill_contents",
  "bills_tags",
  "bills",
  "tags",
  "factions",
  "committees",
  "council_sessions",
] as const;

export async function clearAllData(supabase: AdminClient) {
  assertLocalSeedResetAllowed(
    process.env.SUPABASE_URL,
    process.env.ALLOW_DESTRUCTIVE_SEED_RESET
  );

  console.log("🧹 Clearing existing data...");
  const { error: officeError } = await supabase
    .from("office_terms")
    .delete()
    .not("id", "is", null);
  if (officeError)
    throw new Error(`Failed to clear office terms: ${officeError.message}`);

  for (const table of TABLES_TO_CLEAR) {
    await supabase
      .from(table)
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");
  }

  console.log("✅ Cleared existing data");
}
