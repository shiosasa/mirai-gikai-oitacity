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

const SNS_KEYS = [
  "x",
  "instagram",
  "facebook",
  "youtube",
  "note",
  "line",
] as const;

const baseMayorFields = {
  name: z.string().trim().min(1, "市長の氏名を入力してください").max(200),
  name_kana: optionalText,
  birth_date: optionalText.refine(
    (value) => value === null || parsePoliticianBirthDate(value) !== null,
    "生年月日は実在する年月日を和暦または西暦で入力してください"
  ),
  image_url: optionalUrl,
  official_url: optionalUrl,
  homepage: optionalUrl,
  blog_url: optionalUrl,
  start_date: z.union([dateInput, z.null()]),
  term_number: z.number().int().min(1).max(2147483647).nullable(),
  bio: z
    .string()
    .max(100_000)
    .nullable()
    .transform((value) => value?.trim() || null),
};

export const mayorProfileFormSchema = z.object({
  ...baseMayorFields,
  sns_x: optionalUrl,
  sns_instagram: optionalUrl,
  sns_facebook: optionalUrl,
  sns_youtube: optionalUrl,
  sns_note: optionalUrl,
  sns_line: optionalUrl,
});

export const mayorProfileContentSchema = z.object({
  ...baseMayorFields,
  sns_links: z
    .object({
      x: httpUrl.optional(),
      instagram: httpUrl.optional(),
      facebook: httpUrl.optional(),
      youtube: httpUrl.optional(),
      note: httpUrl.optional(),
      line: httpUrl.optional(),
    })
    .nullable()
    .transform((value) => {
      if (!value) return null;
      const entries = Object.entries(value).filter(
        (entry): entry is [string, string] => typeof entry[1] === "string"
      );
      return entries.length > 0 ? Object.fromEntries(entries) : null;
    }),
});

export const mayorProfileInputSchema = z.object({
  id: z.number().int().positive().max(Number.MAX_SAFE_INTEGER).optional(),
  content: mayorProfileContentSchema,
});

export type MayorProfileContent = z.infer<typeof mayorProfileContentSchema>;
export type MayorProfileInput = z.infer<typeof mayorProfileInputSchema>;
export type MayorProfileRecord = Pick<
  MayorRow,
  "id" | keyof MayorProfileContent
>;
export type MayorProfileFormValues = {
  name: string;
  name_kana: string;
  birth_date: string;
  image_url: string;
  official_url: string;
  homepage: string;
  blog_url: string;
  sns_x: string;
  sns_instagram: string;
  sns_facebook: string;
  sns_youtube: string;
  sns_note: string;
  sns_line: string;
  start_date: string;
  term_number: string;
  bio: string;
};

function readSnsLink(snsLinks: MayorRow["sns_links"], key: string): string {
  if (!snsLinks || typeof snsLinks !== "object" || Array.isArray(snsLinks)) {
    return "";
  }
  const value = Reflect.get(snsLinks, key);
  return typeof value === "string" ? value : "";
}

export function getMayorProfileFormValues(
  mayor: MayorProfileRecord
): MayorProfileFormValues {
  return {
    name: mayor.name ?? "",
    name_kana: mayor.name_kana ?? "",
    birth_date: mayor.birth_date ?? "",
    image_url: mayor.image_url ?? "",
    official_url: mayor.official_url ?? "",
    homepage: mayor.homepage ?? "",
    blog_url: mayor.blog_url ?? "",
    sns_x: readSnsLink(mayor.sns_links, "x"),
    sns_instagram: readSnsLink(mayor.sns_links, "instagram"),
    sns_facebook: readSnsLink(mayor.sns_links, "facebook"),
    sns_youtube: readSnsLink(mayor.sns_links, "youtube"),
    sns_note: readSnsLink(mayor.sns_links, "note"),
    sns_line: readSnsLink(mayor.sns_links, "line"),
    start_date: mayor.start_date ?? "",
    term_number: mayor.term_number?.toString() ?? "",
    bio: mayor.bio ?? "",
  };
}

export function parseMayorProfileForm(form: MayorProfileFormValues) {
  const parsed = mayorProfileFormSchema.safeParse({
    ...form,
    start_date: form.start_date || null,
    term_number: form.term_number.trim() ? Number(form.term_number) : null,
  });
  if (!parsed.success) {
    return parsed;
  }
  const {
    sns_x,
    sns_instagram,
    sns_facebook,
    sns_youtube,
    sns_note,
    sns_line,
    ...rest
  } = parsed.data;
  const snsMap: Record<string, string> = {};
  const entries: [string, string | null][] = [
    ["x", sns_x],
    ["instagram", sns_instagram],
    ["facebook", sns_facebook],
    ["youtube", sns_youtube],
    ["note", sns_note],
    ["line", sns_line],
  ];
  for (const [key, val] of entries) {
    if (val) snsMap[key] = val;
  }
  void SNS_KEYS;
  return {
    success: true as const,
    data: {
      ...rest,
      sns_links: Object.keys(snsMap).length > 0 ? snsMap : null,
    } satisfies MayorProfileContent,
  };
}
