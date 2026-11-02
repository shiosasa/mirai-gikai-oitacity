import { z } from "zod";

export const recordId = z.uuid("IDが不正です");
export const numericId = z.coerce.number().int().positive();
export const dateInput = z.iso.date("日付を正しく入力してください");
export const titleInput = z
  .string()
  .trim()
  .min(1, "タイトルを入力してください")
  .max(500);
export const optionalText = z.string().max(1_000_000);
export const httpUrl = z
  .string()
  .trim()
  .max(4000)
  .refine((value) => {
    if (!value) return true;
    try {
      const url = new URL(value);
      return (
        ["https:", "http:"].includes(url.protocol) &&
        !url.username &&
        !url.password
      );
    } catch {
      return false;
    }
  }, "http:// または https:// のURLを入力してください");

export const youtubeUrl = httpUrl.refine((value) => {
  if (!value) return true;
  try {
    const url = new URL(value);
    if (url.hostname === "youtu.be")
      return /^\/[a-zA-Z0-9_-]{11}$/.test(url.pathname);
    if (
      !["youtube.com", "www.youtube.com", "m.youtube.com"].includes(
        url.hostname
      )
    )
      return false;
    return (
      (url.pathname === "/watch" &&
        /^[a-zA-Z0-9_-]{11}$/.test(url.searchParams.get("v") ?? "")) ||
      /^\/embed\/[a-zA-Z0-9_-]{11}$/.test(url.pathname)
    );
  } catch {
    return false;
  }
}, "YouTubeのwatch?v=、youtu.be、埋め込みURLを指定してください");

export const meetingInput = z.object({
  title: titleInput,
  date: dateInput,
  term: z.string().trim().min(1, "会期を入力してください").max(200),
  meeting_type: z.enum(["本会議", "委員会"]),
});

export const attendeesInput = z.looseObject({
  chair: z.string().nullable().default(null),
  vice_chair: z.string().nullable().default(null),
  members: z.array(z.string()).default([]),
  absent: z.array(z.string()).default([]),
  officials: z.array(z.string()).default([]),
});
export const billInput = z.looseObject({
  number: z.string().nullable().optional(),
  name: z.string().min(1, "議案名を入力してください"),
  description: z.string().nullable().optional(),
  result: z.string().nullable().optional(),
});
export const sessionMetadataInput = z.object({
  attendees: attendeesInput.nullable(),
  bills: z.array(billInput).nullable(),
});

export const sessionInput = z.object({
  session_title: titleInput,
  date: dateInput,
  summary: optionalText,
  detailed_summary: optionalText,
  decisions: optionalText,
  content: optionalText,
  ...sessionMetadataInput.shape,
});

export const proposalInput = z
  .object({
    mayor_proposal_text: optionalText,
    mayor_proposal_summary: optionalText,
    mayor_proposal_source_url: httpUrl,
  })
  .superRefine((value, ctx) => {
    if (
      (value.mayor_proposal_summary.trim() ||
        value.mayor_proposal_source_url) &&
      !value.mayor_proposal_text.trim()
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["mayor_proposal_text"],
        message: "公開対象にするには、対応する公式原文を入力してください",
      });
    }
  });

export const conferenceStatus = z.enum([
  "draft",
  "structuring",
  "review",
  "published",
  "error",
]);
export const conferenceInput = z.object({
  title: titleInput,
  slug: z
    .string()
    .trim()
    .min(1)
    .max(200)
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "URL識別名は半角英小文字・数字・ハイフンで入力してください"
    ),
  held_at: dateInput,
  youtube_url: youtubeUrl,
  status: conferenceStatus,
});
export const conferenceItemInput = z.object({
  item_type: z.enum(["announcement", "qa"]),
  title: titleInput,
  summary: optionalText,
  detail: optionalText,
  material_url: httpUrl,
  order_index: z.coerce.number().int().min(0).max(2147483647),
});
export const conferenceTurnInput = z.object({
  speaker: z.enum(["governor", "reporter", "secretariat"]),
  speaker_name: z.string().trim().max(500),
  content: z
    .string()
    .trim()
    .min(1, "発言内容を入力してください")
    .max(1_000_000),
  order_index: z.coerce.number().int().min(0).max(2147483647),
});
export const archiveInput = z
  .object({
    summary: optionalText,
    publish_status: z.enum(["draft", "published"]),
  })
  .superRefine((value, ctx) => {
    if (value.publish_status === "published" && !value.summary.trim()) {
      ctx.addIssue({
        code: "custom",
        path: ["summary"],
        message: "公開前に会議全体の要約を入力してください",
      });
    }
  });
export const archiveTopicInput = z.object({
  title: titleInput,
  summary: optionalText,
  discussion_summary: optionalText,
});

export const listQueryInput = z.object({
  page: z.coerce.number().int().min(1).max(10000).default(1),
  type: z.enum(["", "本会議", "委員会"]).default(""),
  status: z.enum(["", ...conferenceStatus.options]).default(""),
  committee: z.string().max(200).default(""),
});
export const archiveListQueryInput = listQueryInput.extend({
  status: z.enum(["", "draft", "published"]).default(""),
});
export const pageSize = 30;
export type ListSearchParams = Record<string, string | string[] | undefined>;

export function pageHref(
  path: string,
  search: ListSearchParams,
  page: number
): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(search)) {
    if (typeof value === "string" && key !== "page") params.set(key, value);
  }
  params.set("page", String(page));
  return `${path}?${params}`;
}

export function nonEmptyLines(value: string): string[] {
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}
