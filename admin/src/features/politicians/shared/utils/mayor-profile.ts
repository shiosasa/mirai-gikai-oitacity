import { parsePoliticianBirthDate } from "@mirai-gikai/shared/politicians/birth-date";
import type { Database } from "@mirai-gikai/supabase";
import { z } from "zod";
import {
  dateInput,
  httpUrl,
} from "@/features/content-management/shared/utils/content-input";

type MayorRow = Database["public"]["Tables"]["mayor_profile"]["Row"];
const optionalText = z
  .string()
  .trim()
  .max(2000)
  .nullable()
  .transform((value) => value || null);
const optionalUrl = z
  .union([httpUrl, z.null()])
  .transform((value) => value || null);

export const mayorProfileContentSchema = z.object({
  name: z.string().trim().min(1, "市長の氏名を入力してください").max(200),
  name_kana: optionalText,
  birth_date: optionalText.refine(
    (value) => value === null || parsePoliticianBirthDate(value) !== null,
    "生年月日は実在する年月日を和暦または西暦で入力してください"
  ),
  image_url: optionalUrl,
  official_url: optionalUrl,
  start_date: z.union([dateInput, z.null()]),
  term_number: z.number().int().min(1).max(2147483647).nullable(),
  bio: z
    .string()
    .max(100_000)
    .nullable()
    .transform((value) => value?.trim() || null),
});

export const mayorProfileInputSchema = z.object({
  id: z.number().int().positive().max(Number.MAX_SAFE_INTEGER),
  content: mayorProfileContentSchema,
});

export type MayorProfileContent = z.infer<typeof mayorProfileContentSchema>;
export type MayorProfileInput = z.infer<typeof mayorProfileInputSchema>;
export type MayorProfileRecord = Pick<
  MayorRow,
  "id" | keyof MayorProfileContent
>;
export type MayorProfileFormValues = {
  [K in keyof MayorProfileContent]: string;
};

export function getMayorProfileFormValues(
  mayor: MayorProfileRecord
): MayorProfileFormValues {
  return {
    name: mayor.name ?? "",
    name_kana: mayor.name_kana ?? "",
    birth_date: mayor.birth_date ?? "",
    image_url: mayor.image_url ?? "",
    official_url: mayor.official_url ?? "",
    start_date: mayor.start_date ?? "",
    term_number: mayor.term_number?.toString() ?? "",
    bio: mayor.bio ?? "",
  };
}

export function parseMayorProfileForm(form: MayorProfileFormValues) {
  return mayorProfileContentSchema.safeParse({
    ...form,
    start_date: form.start_date || null,
    term_number: form.term_number.trim() ? Number(form.term_number) : null,
  });
}
