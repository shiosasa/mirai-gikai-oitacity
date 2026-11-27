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

const SNS_KEYS = [
  "x",
  "instagram",
  "facebook",
  "youtube",
  "note",
  "line",
] as const;

const basePoliticianFields = {
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
  blog_url: optionalUrl,
  image_url: optionalUrl,
};

export const politicianProfileSchema = z.object({
  ...basePoliticianFields,
  sns_x: optionalUrl,
  sns_instagram: optionalUrl,
  sns_facebook: optionalUrl,
  sns_youtube: optionalUrl,
  sns_note: optionalUrl,
  sns_line: optionalUrl,
});

const safeHttpUrl = z
  .string()
  .trim()
  .url({ error: "httpまたはhttpsのURLを入力してください" })
  .refine((value) => /^https?:\/\//.test(value), {
    error: "httpまたはhttpsのURLを入力してください",
  });

export const politicianProfilePayloadSchema = z.object({
  ...basePoliticianFields,
  sns_links: z
    .object({
      x: safeHttpUrl.optional(),
      instagram: safeHttpUrl.optional(),
      facebook: safeHttpUrl.optional(),
      youtube: safeHttpUrl.optional(),
      note: safeHttpUrl.optional(),
      line: safeHttpUrl.optional(),
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

export type PoliticianProfileInput = z.infer<
  typeof politicianProfilePayloadSchema
>;
export type PoliticianProfileValues = Omit<PoliticianProfileInput, "id">;
export type PoliticianProfileRecord = Pick<
  PoliticianRow,
  | "id"
  | "name"
  | "name_kana"
  | "number"
  | "birth_date"
  | "election_count"
  | "faction"
  | "standing_committee"
  | "special_committee"
  | "address"
  | "contact"
  | "homepage"
  | "blog_url"
  | "sns_links"
  | "image_url"
>;
export type PoliticianProfileFormValues = {
  name: string;
  name_kana: string;
  number: string;
  birth_date: string;
  election_count: string;
  faction: string;
  standing_committee: string;
  special_committee: string;
  address: string;
  contact: string;
  homepage: string;
  blog_url: string;
  sns_x: string;
  sns_instagram: string;
  sns_facebook: string;
  sns_youtube: string;
  sns_note: string;
  sns_line: string;
  image_url: string;
};

function readSnsLink(
  snsLinks: PoliticianRow["sns_links"],
  key: string
): string {
  if (!snsLinks || typeof snsLinks !== "object" || Array.isArray(snsLinks)) {
    return "";
  }
  const value = Reflect.get(snsLinks, key);
  return typeof value === "string" ? value : "";
}

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
    blog_url: politician?.blog_url ?? "",
    sns_x: readSnsLink(politician?.sns_links ?? null, "x"),
    sns_instagram: readSnsLink(politician?.sns_links ?? null, "instagram"),
    sns_facebook: readSnsLink(politician?.sns_links ?? null, "facebook"),
    sns_youtube: readSnsLink(politician?.sns_links ?? null, "youtube"),
    sns_note: readSnsLink(politician?.sns_links ?? null, "note"),
    sns_line: readSnsLink(politician?.sns_links ?? null, "line"),
    image_url: politician?.image_url ?? "",
  };
}

export function parsePoliticianProfileForm(
  form: PoliticianProfileFormValues,
  id?: string
) {
  const parsed = politicianProfileSchema.safeParse({
    ...form,
    id,
    number: form.number.trim() ? Number(form.number) : null,
    election_count: form.election_count.trim()
      ? Number(form.election_count)
      : null,
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
    } satisfies PoliticianProfileInput,
  };
}
