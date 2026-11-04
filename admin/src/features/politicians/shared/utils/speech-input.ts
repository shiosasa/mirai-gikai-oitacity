import { z } from "zod";

export const speechInputSchema = z
  .object({
    id: z.string().uuid("発言のIDが不正です").optional(),
    politicianId: z.string().uuid("議員を選択してください"),
    sessionId: z.number().int().positive("議事録を選択してください"),
    title: z.string().trim().min(1, "見出しを入力してください"),
    context: z
      .string()
      .trim()
      .transform((value) => value.replace(/\r\n?/g, "\n"))
      .optional()
      .default(""),
    quote: z
      .string()
      .trim()
      .min(1, "発言の引用を入力してください")
      .transform((value) => value.replace(/\r\n?/g, "\n")),
    isPublished: z.boolean(),
    speakerConfirmed: z.boolean(),
  })
  .superRefine((input, ctx) => {
    if (input.isPublished && !input.speakerConfirmed) {
      ctx.addIssue({
        code: "custom",
        path: ["speakerConfirmed"],
        message: "公開前に、議員本人の発言と前後の文脈を確認してください",
      });
    }
  });

export type SpeechInput = z.infer<typeof speechInputSchema>;
