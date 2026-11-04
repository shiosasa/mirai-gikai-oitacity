"use client";

import type { z } from "zod";
import { useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  attendeesInput,
  type billInput,
  nonEmptyLines,
  type sessionMetadataInput,
} from "@/features/content-management/shared/utils/content-input";

type Metadata = z.infer<typeof sessionMetadataInput>;
type Bill = z.infer<typeof billInput>;

export function SessionMetadata({ initial }: { initial: Metadata }) {
  const prefix = useId();
  const [attendees, setAttendees] = useState(initial.attendees);
  const [bills, setBills] = useState(
    initial.bills?.map((bill, index) => ({ key: `existing-${index}`, bill })) ??
      []
  );

  return (
    <section className="space-y-5">
      <input
        type="hidden"
        name="metadata"
        value={JSON.stringify({
          attendees,
          bills:
            initial.bills === null && bills.length === 0
              ? null
              : bills.map((entry) => entry.bill),
        })}
      />
      <h3 className="font-semibold">出席・欠席議員</h3>
      <p className="text-sm text-muted-foreground">
        議員紹介の公開名と同じ表記を使ってください。当局職員を議員欄には入れません。
      </p>
      {(
        [
          { key: "chair", label: "議長・委員長" },
          { key: "vice_chair", label: "副議長・副委員長" },
        ] as const
      ).map(({ key, label }) => (
        <div className="space-y-2" key={key}>
          <Label htmlFor={`${prefix}-${key}`}>{label}</Label>
          <Input
            id={`${prefix}-${key}`}
            value={attendees?.[key] ?? ""}
            onChange={(event) =>
              setAttendees({
                ...(attendees ?? attendeesInput.parse({})),
                [key]: event.target.value || null,
              })
            }
          />
        </div>
      ))}
      {(
        [
          { key: "members", label: "出席議員・委員" },
          { key: "absent", label: "欠席議員" },
          { key: "officials", label: "当局・職員（議員欄には表示されません）" },
        ] as const
      ).map(({ key, label }) => (
        <div className="space-y-2" key={key}>
          <Label htmlFor={`${prefix}-${key}`}>{label}（1行1人）</Label>
          <Textarea
            id={`${prefix}-${key}`}
            defaultValue={attendees?.[key]?.join("\n") ?? ""}
            onChange={(event) =>
              setAttendees({
                ...(attendees ?? attendeesInput.parse({})),
                [key]: nonEmptyLines(event.target.value),
              })
            }
          />
        </div>
      ))}
      <h3 className="font-semibold">審議された議案</h3>
      {bills.map(({ key, bill }) => (
        <div key={key} className="space-y-3 rounded-md border p-3">
          {(
            [
              { field: "number", label: "議案番号" },
              { field: "name", label: "議案名" },
              { field: "description", label: "説明" },
              { field: "result", label: "審議結果" },
            ] as const
          ).map(({ field, label }) => (
            <div className="space-y-2" key={field}>
              <Label htmlFor={`${prefix}-${key}-${field}`}>{label}</Label>
              <Input
                id={`${prefix}-${key}-${field}`}
                required={field === "name"}
                value={bill[field] ?? ""}
                onChange={(event) =>
                  setBills(
                    bills.map((entry) =>
                      entry.key === key
                        ? {
                            ...entry,
                            bill: {
                              ...entry.bill,
                              [field]: event.target.value,
                            },
                          }
                        : entry
                    )
                  )
                }
              />
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              if (
                window.confirm(
                  "この議案を編集内容から外しますか？保存するまでは反映されません。"
                )
              )
                setBills(bills.filter((entry) => entry.key !== key));
            }}
          >
            この議案を外す
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        onClick={() => {
          const bill: Bill = {
            name: "",
            number: "",
            description: "",
            result: "",
          };
          setBills([...bills, { key: crypto.randomUUID(), bill }]);
        }}
      >
        議案を追加
      </Button>
    </section>
  );
}
