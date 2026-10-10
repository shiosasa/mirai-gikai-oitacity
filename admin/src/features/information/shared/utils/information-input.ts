import { z } from "zod";

export const informationInputSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().trim().min(1, "タイトルを入力してください").max(200),
  body: z.string().trim().max(10000),
  publishedAt: z.string().datetime({ offset: true }),
  isPublished: z.boolean(),
});

export type InformationInput = z.infer<typeof informationInputSchema>;
