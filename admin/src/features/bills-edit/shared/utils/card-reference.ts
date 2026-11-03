import type { Json } from "@mirai-gikai/supabase";
import { z } from "zod";
import { recordId } from "@/features/content-management/shared/utils/content-input";

export const cardReferenceInput = z.object({
  billId: recordId,
  sessionId: z.coerce.number().int().positive(),
  index: z.coerce.number().int().nonnegative(),
  name: z.string().trim().min(1, "議案名を入力してください").max(500),
  number: z.string().max(100),
  description: z.string().max(50000),
});

export function cardReferenceFilter(billId: string): string {
  return JSON.stringify([{ billId: recordId.parse(billId) }]);
}

function isObject(value: Json): value is { [key: string]: Json | undefined } {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

export function findCardReferences(bills: Json | null, billId: string) {
  if (!Array.isArray(bills))
    throw new Error("議事録の議案データ形式を確認してください");
  return bills.flatMap((value, index) => {
    if (!isObject(value) || value.billId !== billId) return [];
    if (
      typeof value.name !== "string" ||
      (value.number != null && typeof value.number !== "string") ||
      (value.description != null && typeof value.description !== "string")
    ) {
      throw new Error("議案名・番号・説明のデータ形式を確認してください");
    }
    return [
      {
        index,
        name: value.name,
        number: value.number ?? "",
        description: value.description ?? "",
      },
    ];
  });
}

export function updateCardReference(
  bills: Json | null,
  input: z.infer<typeof cardReferenceInput>
): Json[] {
  if (!Array.isArray(bills))
    throw new Error("議事録の議案データ形式を確認してください");
  const current = bills[input.index];
  if (
    current === undefined ||
    !isObject(current) ||
    current.billId !== input.billId
  ) {
    throw new Error("対象の議案が変更されました。再読み込みしてください");
  }
  return bills.map((value, index) =>
    index === input.index
      ? {
          ...current,
          name: input.name,
          number: input.number || null,
          description: input.description || null,
        }
      : value
  );
}
