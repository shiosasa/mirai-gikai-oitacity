import { parsePoliticianBirthDate } from "@mirai-gikai/shared/politicians/birth-date";
import type { Database } from "@mirai-gikai/supabase";
import { z } from "zod";

type PoliticianRow = Database["public"]["Tables"]["politicians"]["Row"];

const optionalText = z
  .string()
  .trim()
  .max(2000, "2000文字以内で入力してください")
  .nullable()
  .transform((value) => value || null);
const optionalUrl = optionalText.pipe(
  z
    .url({ error: "httpまたはhttpsのURLを入力してください" })
    .refine((value) => /^https?:\/\//.test(value), {
      error: "httpまたはhttpsのURLを入力してください",
    })
    .nullable()
);
const integer = z.number().int().max(2147483647);

export const politicianProfileSchema = z.object({
  id: z.uuid().optional(),
  name: z
    .string()
    .trim()
    .min(1, "氏名を入力してください")
    .max(200)
    .refine((name) => name !== "欠番", "欠番は議員名に使用できません"),
  name_kana: optionalText,
  number: integer.positive("議席番号は1以上の整数で入力してください"),
  birth_date: optionalText.refine(
    (value) => value === null || parsePoliticianBirthDate(value) !== null,
    "生年月日は実在する年月日を和暦または西暦で入力してください"
  ),
  election_count: integer.nonnegative().nullable(),
  faction: optionalText,
  standing_committee: optionalText,
  special_committee: optionalText,
  address: optionalText,
  contact: optionalText,
  homepage: optionalUrl,
  image_url: optionalUrl,
});

export type PoliticianProfileInput = z.infer<typeof politicianProfileSchema>;
export type PoliticianProfileValues = Omit<PoliticianProfileInput, "id">;
export type PoliticianProfileRecord = Pick<
  PoliticianRow,
  "id" | keyof PoliticianProfileValues
>;
export type PoliticianProfileFormValues = {
  [K in keyof PoliticianProfileValues]: string;
};

export function getPoliticianProfileFormValues(
  politician?: PoliticianProfileRecord
): PoliticianProfileFormValues {
  return {
    name: politician?.name ?? "",
    name_kana: politician?.name_kana ?? "",
    number: politician?.number.toString() ?? "",
    birth_date: politician?.birth_date ?? "",
    election_count: politician?.election_count?.toString() ?? "",
    faction: politician?.faction ?? "",
    standing_committee: politician?.standing_committee ?? "",
    special_committee: politician?.special_committee ?? "",
    address: politician?.address ?? "",
    contact: politician?.contact ?? "",
    homepage: politician?.homepage ?? "",
    image_url: politician?.image_url ?? "",
  };
}

export function parsePoliticianProfileForm(
  form: PoliticianProfileFormValues,
  id?: string
) {
  return politicianProfileSchema.safeParse({
    ...form,
    id,
    number: form.number.trim() ? Number(form.number) : null,
    election_count: form.election_count.trim()
      ? Number(form.election_count)
      : null,
  });
}
