"use server";

import { createAdminClient } from "@mirai-gikai/supabase";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/features/auth/server/lib/auth-server";
import { invalidateWebCache } from "@/lib/utils/cache-invalidation";
import {
  cardReferenceInput,
  updateCardReference,
} from "../../shared/utils/card-reference";

export async function saveCardReference(data: FormData) {
  await requireAdmin();
  const input = cardReferenceInput.parse(Object.fromEntries(data));
  const db = createAdminClient();
  const { data: session, error } = await db
    .from("meeting_sessions")
    .select("bills")
    .eq("id", input.sessionId)
    .single();
  if (error) throw new Error(`議事録を確認できませんでした: ${error.message}`);
  const updated = updateCardReference(session.bills, input);
  const expected = data.get("expected_bills");
  if (
    typeof expected !== "string" ||
    JSON.stringify(session.bills) !== expected
  ) {
    throw new Error("別の操作で議事録が更新されました。再読み込みしてください");
  }
  const { error: saveError } = await db
    .from("meeting_sessions")
    .update({ bills: updated })
    .eq("id", input.sessionId)
    .eq("bills", JSON.stringify(session.bills))
    .select("id")
    .single();
  if (saveError)
    throw new Error(`カードを保存できませんでした: ${saveError.message}`);
  await invalidateWebCache();
  revalidatePath(`/bills/${input.billId}/card/edit`);
  revalidatePath("/minutes");
}
