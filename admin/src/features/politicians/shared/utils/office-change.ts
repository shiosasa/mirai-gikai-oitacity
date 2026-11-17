import { z } from "zod";
import {
  dateInput,
  httpUrl,
} from "@/features/content-management/shared/utils/content-input";

export const officeChangeSchema = z
  .object({
    role: z.enum(["mayor", "councillor"]),
    personId: z.string().min(1),
    action: z.enum(["begin", "retire", "renew", "replace", "confirm-start"]),
    expectedTerm: z.number().int().positive().nullable(),
    startedOn: z.union([dateInput, z.null()]),
    endedOn: z.union([dateInput, z.null()]),
    successorId: z.string().nullable(),
    seatNumber: z.number().int().positive().max(2147483647).nullable(),
    termNumber: z.number().int().positive().max(2147483647).nullable(),
    sourceUrl: httpUrl.refine(
      (value) => !!value,
      "公式出典URLを入力してください"
    ),
  })
  .superRefine((value, ctx) => {
    const personSchema =
      value.role === "mayor"
        ? z
            .string()
            .regex(/^[1-9]\d*$/)
            .refine((id) => Number.isSafeInteger(Number(id)))
        : z.uuid();
    for (const [key, id] of [
      ["personId", value.personId],
      ...(value.action === "replace"
        ? [["successorId", value.successorId]]
        : []),
    ]) {
      if (!personSchema.safeParse(id).success) {
        ctx.addIssue({
          code: "custom",
          path: [key ?? "personId"],
          message: "人物の選択を確認してください",
        });
      }
    }
    if ((value.action === "begin") !== (value.expectedTerm === null)) {
      ctx.addIssue({
        code: "custom",
        message: "現職・任期の状態が一致しません。再読み込みしてください",
      });
    }
    if (
      value.action !== "begin" &&
      value.action !== "confirm-start" &&
      !value.endedOn
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["endedOn"],
        message: "退任日（在任最終日）が必要です",
      });
    }
    if (value.action === "confirm-start" && !value.startedOn) {
      ctx.addIssue({
        code: "custom",
        message: "確認した就任日を入力してください",
      });
    }
    if (
      value.action !== "retire" &&
      value.action !== "confirm-start" &&
      (!value.startedOn ||
        !value.termNumber ||
        (value.role === "councillor" && !value.seatNumber))
    ) {
      ctx.addIssue({
        code: "custom",
        message: "就任日・期数・議員の議席番号を入力してください",
      });
    }
    if (value.action === "replace" && value.successorId === value.personId) {
      ctx.addIssue({
        code: "custom",
        path: ["successorId"],
        message: "別の後任者を選択してください",
      });
    }
    if (
      value.action !== "begin" &&
      value.action !== "retire" &&
      value.action !== "confirm-start" &&
      value.startedOn &&
      value.endedOn &&
      value.startedOn <= value.endedOn
    ) {
      ctx.addIssue({
        code: "custom",
        message:
          "就任日は退任日の翌日以降にしてください。同日の引継ぎは日付を確認してください",
      });
    }
  });

export type OfficeChangeInput = z.infer<typeof officeChangeSchema>;
export type OfficePerson = {
  id: string;
  role: "mayor" | "councillor";
  name: string;
  isCurrent: boolean;
};
